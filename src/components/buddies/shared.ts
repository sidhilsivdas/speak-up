import type { CSSProperties } from 'react'

export type AvatarMood = 'idle' | 'talking' | 'listening' | 'paused'

export interface BuddyProps {
  mood: AvatarMood
  /** The word being spoken, while talking. */
  word: string | null
  wordKey: number
  wordMs: number
}

// Faces move smoothly between shapes instead of snapping.
// Values are set as styles (not just attributes) so browsers animate the change.
export const ease = (ms: number, values: Record<string, string | number> = {}) =>
  ({ transition: `all ${ms}ms ease-out`, ...values }) as CSSProperties
