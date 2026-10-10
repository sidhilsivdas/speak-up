export interface Word {
  text: string
  start: number
  end: number
}

/** A piece of the script spoken as one utterance, with the words it covers. */
export interface Segment {
  text: string
  /** Position of `text` inside the full script, used to map boundary events back to words. */
  offset: number
  firstWord: number
  lastWord: number
}

export type Mode = 'listen' | 'build' | 'fluent'

const SENTENCE_END = /[.!?…]["'”’)\]]*$/
const FLUENT_REPEATS = 5
// Chrome stops speaking a single utterance after roughly 15 seconds,
// so longer scripts are spoken sentence by sentence instead.
const MAX_SINGLE_UTTERANCE = 200

/** Splits on any run of whitespace, so double spaces never produce empty words. */
export function tokenize(text: string): Word[] {
  return Array.from(text.matchAll(/\S+/g), (m) => ({
    text: m[0],
    start: m.index,
    end: m.index + m[0].length,
  }))
}

function span(text: string, words: Word[], first: number, last: number): Segment {
  return {
    text: text.slice(words[first].start, words[last].end),
    offset: words[first].start,
    firstWord: first,
    lastWord: last,
  }
}

/** Groups words into sentences. Never yields an empty sentence, and "3.5" stays one word. */
export function splitSentences(text: string, words: Word[]): Segment[] {
  const sentences: Segment[] = []
  let first = 0
  words.forEach((word, i) => {
    if (SENTENCE_END.test(word.text) || i === words.length - 1) {
      sentences.push(span(text, words, first, i))
      first = i + 1
    }
  })
  return sentences
}

export function buildSegments(mode: Mode, text: string, words: Word[]): Segment[] {
  if (words.length === 0) return []
  const sentences = splitSentences(text, words)

  switch (mode) {
    case 'listen':
      return sentences
    case 'build':
      // Grow each sentence one word at a time: "I", "I will", "I will practice", ...
      return sentences.flatMap((s) =>
        Array.from({ length: s.lastWord - s.firstWord + 1 }, (_, k) =>
          span(text, words, s.firstWord, s.firstWord + k),
        ),
      )
    case 'fluent': {
      const round =
        text.length <= MAX_SINGLE_UTTERANCE ? [span(text, words, 0, words.length - 1)] : sentences
      return Array.from({ length: FLUENT_REPEATS }, () => round).flat()
    }
  }
}

/** Finds the word a boundary event points at, given its char index in the full script. */
export function wordAt(words: Word[], charIndex: number, segment: Segment): number {
  for (let i = segment.lastWord; i >= segment.firstWord; i--) {
    if (words[i].start <= charIndex) return i
  }
  return segment.firstWord
}

// Rough timing of speech at rate 1, used when a voice doesn't report word boundaries.
const MS_PER_WORD = 90
const MS_PER_LETTER = 55
const MS_AFTER_COMMA = 200
const MS_AFTER_SENTENCE = 350

/** Estimated time to say a word at rate 1, and the pause its punctuation adds after it. */
export function wordTiming(text: string) {
  const letters = text.replace(/[^\p{L}\p{N}]/gu, '').length
  const speakMs = MS_PER_WORD + letters * MS_PER_LETTER
  const pauseMs = /[,;:]["'”’)\]]*$/.test(text) ? MS_AFTER_COMMA : SENTENCE_END.test(text) ? MS_AFTER_SENTENCE : 0
  return { speakMs, pauseMs }
}

/**
 * Estimates when each word of a segment finishes being spoken, in ms from the start.
 * `scale` corrects the estimate for the current voice after it has been measured.
 */
export function estimateTimeline(words: Word[], segment: Segment, rate: number, scale: number): number[] {
  const ends: number[] = []
  let t = 0
  for (let i = segment.firstWord; i <= segment.lastWord; i++) {
    const { speakMs, pauseMs } = wordTiming(words[i].text)
    t += ((speakMs + pauseMs) / rate) * scale
    ends.push(t)
  }
  return ends
}
