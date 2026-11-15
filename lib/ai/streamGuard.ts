// The guide-don't-reveal contract, enforced over a stream.
//
// Non-streaming, this is easy: generate the whole reply, scan it, discard it if it leaks.
// Streaming removes that luxury — text is already on its way to the learner by the time a
// violation appears. So the guard withholds a tail of generated text while it scans, and
// only releases text it has already cleared.
//
// Kept free of Next.js imports so the demo and leak-test scripts can drive it directly,
// without an HTTP layer or a Supabase session.

import {
    capReply,
    isFilterableAnswer,
    leaksAnswer,
    EMPTY_REPLY_FALLBACK,
    HINT_FALLBACK,
    MAX_REPLY_CHARS,
} from './malamiPrompt'

// One frame per line of NDJSON on the wire.
//   token   append to the message being shown
//   replace discard what was shown, show this instead
//   error   stream failed mid-flight
//   done    clean end
export type Frame =
    | { type: 'token'; content: string }
    | { type: 'replace'; content: string }
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
// and streams with no holdback at all. The same goes for an answer the leak filter declines
// to judge (too short, a common English word, or already visible in the question — see
// isFilterableAnswer): the guard could never fire for it, so withholding text would only
// add delay. `question` is what makes that last rule work; pass it whenever you have it.
export async function* guardedStream(
    source: AsyncIterable<string>,
    correctAnswer?: string,
    question = '',
): AsyncGenerator<Frame> {
    const answer = correctAnswer && isFilterableAnswer(correctAnswer, question) ? correctAnswer : undefined
    const holdback = answer ? holdbackFor(answer) : 0
    let accumulated = ''
    let flushed = 0

    for await (const fragment of source) {
        accumulated += fragment

        // Checked against everything generated so far, never against a single fragment: a
        // model emits "mai" and "maita" as separate tokens and neither contains the answer
        // on its own.
        if (answer && leaksAnswer(accumulated, answer, question)) {
            yield { type: 'replace', content: HINT_FALLBACK }
            yield { type: 'done' }
            return
        }

        const safeUpTo = Math.min(accumulated.length - holdback, MAX_REPLY_CHARS)
        if (safeUpTo > flushed) {
            yield { type: 'token', content: accumulated.slice(flushed, safeUpTo) }
            flushed = safeUpTo
        }
        if (flushed >= MAX_REPLY_CHARS) break
    }

    // Generation finished and the final leak check passed, so the withheld tail can go out.
    const final = capReply(accumulated)

    // Nothing usable arrived (a hard stop on the first token, or a model that answers with
    // whitespace). The chat page hides an empty bubble, so without this the learner would
    // watch the typing dots stop and get nothing at all.
    if (final === '') {
        yield { type: 'replace', content: EMPTY_REPLY_FALLBACK }
        yield { type: 'done' }
        return
    }

    if (final.length > flushed) {
        yield { type: 'token', content: final.slice(flushed) }
    }
    yield { type: 'done' }
}
