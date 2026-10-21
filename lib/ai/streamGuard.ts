// The guide-don't-reveal contract, enforced over a stream.
//
// Non-streaming, this is easy: generate the whole reply, scan it, discard it if it leaks.
// Streaming removes that luxury — text is already on its way to the learner by the time a
// violation appears. So the guard withholds a tail of generated text while it scans, and
// only releases text it has already cleared.
//
// Kept free of Next.js imports so the demo and leak-test scripts can drive it directly,
// without an HTTP layer or a Supabase session.

import { capReply, leaksAnswer, HINT_FALLBACK, MAX_REPLY_CHARS } from './malamiPrompt'

// One frame per line of NDJSON on the wire.
//   token   append to the message being shown
//   replace discard what was shown, show this instead
//   error   stream failed mid-flight
//   done    clean end
export type Frame =
    | { type: 'token'; value: string }
    | { type: 'replace'; value: string }
    | { type: 'error'; message: string }
    | { type: 'done' }

// How much generated text is withheld from the learner while the leak check runs.
//
// leaksAnswer() matches on normalised text (lowercased, whitespace collapsed), so a reply
// can render an answer across more raw characters than the answer itself contains — a model
// may spread code over several lines. Doubling the answer length plus a fixed margin covers
// realistic reformatting, which means the closing characters of an answer are still
// withheld at the moment a match is detected, and the complete answer never reaches the
// client.
//
// Tradeoff: a reply padded with extreme whitespace could in principle outrun the window.
// The airtight alternative is buffering the entire reply before releasing any of it, which
// reinstates exactly the wait that streaming exists to remove.
export const holdbackFor = (answer: string) => answer.length * 2 + 16

// Wraps a raw fragment stream and yields wire frames.
//
// `correctAnswer` is only present for exercise context; plain chat has nothing to protect
// and streams with no holdback at all.
export async function* guardedStream(
    source: AsyncIterable<string>,
    correctAnswer?: string,
): AsyncGenerator<Frame> {
    const holdback = correctAnswer ? holdbackFor(correctAnswer) : 0
    let accumulated = ''
    let flushed = 0

    for await (const fragment of source) {
        accumulated += fragment

        // Checked against everything generated so far, never against a single fragment: a
        // model emits "mai" and "maita" as separate tokens and neither contains the answer
        // on its own.
        if (correctAnswer && leaksAnswer(accumulated, correctAnswer)) {
            yield { type: 'replace', value: HINT_FALLBACK }
            yield { type: 'done' }
            return
        }

        const safeUpTo = Math.min(accumulated.length - holdback, MAX_REPLY_CHARS)
        if (safeUpTo > flushed) {
            yield { type: 'token', value: accumulated.slice(flushed, safeUpTo) }
            flushed = safeUpTo
        }
        if (flushed >= MAX_REPLY_CHARS) break
    }

    // Generation finished and the final leak check passed, so the withheld tail can go out.
    const final = capReply(accumulated)
    if (final.length > flushed) {
        yield { type: 'token', value: final.slice(flushed) }
    }
    yield { type: 'done' }
}
