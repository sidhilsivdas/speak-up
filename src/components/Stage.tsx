import { Fragment } from 'react'
import { wordColor } from '../lib/colors'
import type { Segment, Word } from '../lib/segments'

interface Props {
  words: Word[]
  segment: Segment | null
  wordIndex: number | null
}

/**
 * Shows the script as colourful words. The part being spoken stays bright, the rest fades,
 * and the current word pops up in rainbow colours. Some voices never fire word boundary
 * events; the bright segment still shows where you are.
 */
export function Stage({ words, segment, wordIndex }: Props) {
  if (words.length === 0) {
    return <p className="font-display text-xl text-violet-300">Add a line to start practising.</p>
  }

  return (
    // Keyed by the text so a new line plays the entrance animation again.
    <p key={words.map((w) => w.text).join(' ')} className="font-display text-3xl leading-[1.5] font-semibold sm:text-4xl sm:leading-[1.5]">
      {words.map((word, i) => {
        const inSegment = !segment || (i >= segment.firstWord && i <= segment.lastWord)
        const active = i === wordIndex
        return (
          <Fragment key={i}>
            {/* The entrance animation lives on the wrapper so it doesn't replay when the highlight moves on. */}
            <span className="inline-block animate-rise" style={{ animationDelay: `${i * 45}ms` }}>
              <span
                className={[
                  'relative inline-block px-0.5 transition-[color,opacity] duration-200',
                  active
                    ? 'rainbow-text z-10 animate-pop drop-shadow-[0_4px_10px_rgba(139,92,246,0.35)]'
                    : inSegment
                      ? wordColor(i)
                      : 'text-violet-200',
                ].join(' ')}
              >
                {word.text}
                {active && (
                  <>
                    <span aria-hidden className="absolute -top-3 -right-3 animate-twinkle text-lg text-amber-400">
                      ✦
                    </span>
                    <span
                      aria-hidden
                      className="absolute -bottom-1 -left-2 animate-twinkle text-sm text-pink-400 [animation-delay:300ms]"
                    >
                      ✦
                    </span>
                  </>
                )}
              </span>
            </span>{' '}
          </Fragment>
        )
      })}
    </p>
  )
}
