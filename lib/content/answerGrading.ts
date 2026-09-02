// Hausa-aware grading for text exercises.
//
// Learners type on standard phone/laptop keyboards that lack the hooked
// letters (ƙ ɗ ɓ) and the ʼ of Hausa orthography, so short answers are
// compared in a normalized form rather than as exact strings. Long,
// essay-style answers (the book's answer-key explanations) cannot be graded
// by string comparison at all — those are routed to a self-check flow.

const SELF_CHECK_WORD_THRESHOLD = 5

export function normalizeHausaAnswer(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // combining marks some mobile keyboards emit
    .replace(/ƙ/g, 'k')
    .replace(/ɗ/g, 'd')
    .replace(/ɓ/g, 'b')
    .replace(/[’‘ʼ'`´]/g, '')
    .replace(/[.,;:!?()"«»\-–—/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function gradeShortAnswer(userAnswer: string, correctAnswer: string): boolean {
  return normalizeHausaAnswer(userAnswer) === normalizeHausaAnswer(correctAnswer)
}

// Answers of five words or more are answer-key explanations a learner can
// never reproduce verbatim — grade those by self-check instead.
export function isSelfCheckAnswer(correctAnswer: string): boolean {
  return correctAnswer.trim().split(/\s+/).length >= SELF_CHECK_WORD_THRESHOLD
}
