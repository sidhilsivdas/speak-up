/**
 * Mouth shapes ("visemes") for a cartoon face. Text-based and approximate:
 * each word is turned into the sequence of shapes its letters suggest.
 */
export type Viseme = 'rest' | 'MBP' | 'FV' | 'AI' | 'E' | 'O' | 'U' | 'L' | 'CDG'

export interface MouthShape {
  /** Half-width and half-height of the open mouth. */
  w: number
  h: number
  teeth: number
  tongue: number
}

export const MOUTH: Record<Viseme, MouthShape> = {
  rest: { w: 14, h: 0, teeth: 0, tongue: 0 },
  MBP: { w: 13, h: 1, teeth: 0, tongue: 0 },
  FV: { w: 15, h: 5, teeth: 1, tongue: 0 },
  AI: { w: 17, h: 14, teeth: 1, tongue: 1 },
  E: { w: 19, h: 8, teeth: 1, tongue: 0 },
  O: { w: 11, h: 12, teeth: 0, tongue: 1 },
  U: { w: 7, h: 7, teeth: 0, tongue: 0 },
  L: { w: 14, h: 10, teeth: 1, tongue: 1 },
  CDG: { w: 16, h: 5, teeth: 1, tongue: 0 },
}

// Checked before single letters, longest first.
const GROUPS: [string, Viseme][] = [
  ['igh', 'AI'],
  ['th', 'L'],
  ['sh', 'CDG'],
  ['ch', 'CDG'],
  ['ck', 'CDG'],
  ['ng', 'CDG'],
  ['ph', 'FV'],
  ['wh', 'U'],
  ['qu', 'U'],
  ['oo', 'U'],
  ['ee', 'E'],
  ['ea', 'E'],
  ['ay', 'E'],
  ['ai', 'E'],
  ['ou', 'O'],
  ['ow', 'O'],
]

const LETTERS: Record<string, Viseme> = {
  a: 'AI', i: 'AI', e: 'E', y: 'E', o: 'O', u: 'U', w: 'U', q: 'U',
  m: 'MBP', b: 'MBP', p: 'MBP', f: 'FV', v: 'FV',
  l: 'L', t: 'L', d: 'L', n: 'L',
  c: 'CDG', g: 'CDG', k: 'CDG', s: 'CDG', z: 'CDG', x: 'CDG', j: 'CDG', r: 'CDG',
}

export function toVisemes(word: string): Viseme[] {
  let text = word.toLowerCase().replace(/[^a-z]/g, '')
  // Silent final "e", as in "make" or "time".
  if (text.length > 3 && /[^aeiou]e$/.test(text)) text = text.slice(0, -1)

  const shapes: Viseme[] = []
  for (let i = 0; i < text.length; ) {
    const group = GROUPS.find(([letters]) => text.startsWith(letters, i))
    const shape = group ? group[1] : LETTERS[text[i]]
    i += group ? group[0].length : 1
    if (shape && shape !== shapes[shapes.length - 1]) shapes.push(shape)
  }
  // Numbers and symbols still get some movement.
  return shapes.length > 0 ? shapes : ['AI', 'E']
}
