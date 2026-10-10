import { Suspense } from 'react'
import { BUDDIES, type BuddyId } from './buddies'
import type { AvatarMood } from './buddies/shared'

interface Props {
  buddyId: BuddyId
  mood: AvatarMood
  word: string | null
  wordKey: number
  wordMs: number
  /** Changes on every turn so the "Repeat after me" bubble pops in again. */
  turnKey: number
  className?: string
}

/** The speaking buddy, with a "Repeat after me" bubble while the learner takes their turn. */
export function BuddyPanel({ buddyId, mood, word, wordKey, wordMs, turnKey, className }: Props) {
  const buddy = BUDDIES[buddyId] ?? BUDDIES.leo

  return (
    <div className={`relative ${className ?? ''}`}>
      {mood === 'listening' && (
        <div key={turnKey} className="absolute -top-5 left-1/2 z-20 -translate-x-1/2">
          <div className="relative animate-rise rounded-2xl border-2 border-pink-300 bg-white px-3.5 py-1.5 font-display text-base font-bold whitespace-nowrap text-pink-500 shadow-lg shadow-pink-200/70">
            Repeat after me! 🎤
            <span
              aria-hidden
              className="absolute -bottom-2 left-1/2 size-3.5 -translate-x-1/2 rotate-45 border-r-2 border-b-2 border-pink-300 bg-white"
            />
          </div>
        </div>
      )}
      <div
        className={
          buddyId === 'leo'
            ? 'w-full overflow-hidden rounded-[2rem] border-4 border-violet-100 bg-radial-[at_50%_30%] from-white via-violet-50 to-violet-200 shadow-lg shadow-violet-200/60'
            : 'w-full'
        }
      >
        <Suspense fallback={null}>
          <buddy.Component mood={mood} word={word} wordKey={wordKey} wordMs={wordMs} />
        </Suspense>
      </div>
    </div>
  )
}
