/** Each word gets its own colour, cycling through this palette. */
export const WORD_COLORS = [
  'text-pink-500',
  'text-orange-500',
  'text-amber-500',
  'text-emerald-500',
  'text-sky-500',
  'text-violet-600',
]

export const wordColor = (index: number) => WORD_COLORS[index % WORD_COLORS.length]
