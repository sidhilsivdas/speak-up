const NOVELTY = /\b(albert|bad news|bahh|bells|boing|bubbles|cellos|eddy|flo|fred|good news|grandma|grandpa|jester|junior|kathy|organ|ralph|reed|rocko|sandy|shelley|superstar|trinoids|whisper|wobble|zarvox)\b/

export const isEnglish = (voice: SpeechSynthesisVoice) => /^en([-_]|$)/i.test(voice.lang)

/** True for the cloud and neural voices that sound close to a real person. */
export function isNaturalVoice(voice: SpeechSynthesisVoice) {
  return /natural|neural|google|premium|enhanced/i.test(voice.name)
}

/** Higher is better: English first, then natural-sounding voices, never the novelty ones. */
export function voiceScore(voice: SpeechSynthesisVoice) {
  const name = voice.name.toLowerCase()
  let score = 0
  if (isEnglish(voice)) score += 100
  if (isNaturalVoice(voice)) score += 50
  if (/\b(samantha|daniel|karen|moira|serena|tessa|ava|allison|susan|aria|jenny|guy|sonia|libby)\b/.test(name)) score += 20
  if (!voice.localService) score += 10
  if (/en[-_](us|gb)/i.test(voice.lang)) score += 5
  if (NOVELTY.test(name)) score -= 200
  return score
}

export function rankVoices(voices: SpeechSynthesisVoice[]) {
  return [...voices].sort((a, b) => voiceScore(b) - voiceScore(a) || a.name.localeCompare(b.name))
}

/** Rough words per minute for a speech rate; most voices speak about 175 wpm at rate 1. */
export const wordsPerMinute = (rate: number) => Math.round((175 * rate) / 5) * 5

/** Speaking speeds a learner would recognise: slow and clear, everyday conversation, fast native speech. */
export const PACE_PRESETS = [
  { label: '🐢 Learner', rate: 0.75 },
  { label: '🙂 Natural', rate: 0.9 },
  { label: '🐇 Native fast', rate: 1.15 },
]
