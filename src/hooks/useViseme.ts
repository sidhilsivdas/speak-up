import { useEffect, useState } from 'react'
import { toVisemes, type Viseme } from '../lib/visemes'

/**
 * The mouth shape to show right now: steps through the shapes the current word's letters
 * suggest, spread over the word's estimated duration, and relaxes to 'rest' when idle.
 */
export function useViseme(talking: boolean, word: string | null, wordKey: number, wordMs: number) {
  const [viseme, setViseme] = useState<Viseme>('rest')

  useEffect(() => {
    if (!talking || !word) {
      setViseme('rest')
      return
    }
    const shapes = toVisemes(word)
    const start = performance.now()
    let frame = 0
    let shown: Viseme | null = null
    const tick = () => {
      const progress = (performance.now() - start) / Math.max(wordMs, 120)
      // Hold the last shape briefly, then relax the mouth if the next word is late.
      const next = progress >= 1.2 ? 'rest' : shapes[Math.min(shapes.length - 1, Math.floor(progress * shapes.length))]
      // Runs every frame, so only touch React state when the shape changes.
      if (next !== shown) {
        shown = next
        setViseme(next)
      }
      if (progress < 1.2) frame = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [talking, word, wordKey, wordMs])

  return viseme
}
