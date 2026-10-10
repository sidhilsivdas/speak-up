import { useCallback, useEffect, useRef, useState } from 'react'
import { estimateTimeline, wordAt, wordTiming, type Segment, type Word } from '../lib/segments'
import { speechSupported } from './useVoices'

export type SpeechStatus = 'idle' | 'speaking' | 'paused'

export interface SpeechState {
  status: SpeechStatus
  segment: Segment | null
  wordIndex: number | null
  /** Changes every time a word starts, even when the same word is spoken again. */
  wordKey: number
  /** Estimated time the current word takes to say, in ms. */
  wordMs: number
  step: number
  total: number
  /** True during the "repeat after me" gap, while the learner says the line back. */
  yourTurn: boolean
}

export interface SpeakOptions {
  voice: SpeechSynthesisVoice | null
  rate: number
  pitch: number
  /** Leave the learner time to repeat each segment before moving on. */
  repeatAfterMe: boolean
  /** Natural pause between segments when not waiting for the learner, in ms. */
  pauseMs: number
}

interface Gap {
  timer: number
  remaining: number
  startedAt: number
  next: () => void
}

const IDLE: SpeechState = { status: 'idle', segment: null, wordIndex: null, wordKey: 0, wordMs: 0, step: 0, total: 0, yourTurn: false }

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/**
 * Speaks segments one after another and tracks which word is being spoken.
 *
 * Word position comes from the voice's boundary events when it sends them. Many voices
 * (including Chrome's Google voices) never do, so a timing estimate drives the highlight
 * instead, and it is re-measured against each finished segment to fit the voice.
 *
 * Each run gets an id so that events from a cancelled run (which browsers fire
 * asynchronously after `cancel()`) can't overwrite the state of the new one.
 */
export function useSpeech() {
  const [state, setState] = useState<SpeechState>(IDLE)
  const runRef = useRef(0)
  // Settles the promise returned by `speak`: true when the run finished, false when cut short.
  const settleRef = useRef<((finished: boolean) => void) | null>(null)
  const wordKeyRef = useRef(0)
  // Chrome can garbage-collect an utterance mid-speech and never fire `onend`
  // unless something keeps a reference to it.
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const rafRef = useRef(0)
  const gapRef = useRef<Gap | null>(null)
  const clockRef = useRef({ startedAt: 0, pausedAt: null as number | null, pausedTotal: 0 })
  // Per-voice correction of the timing estimate, learned as the voice speaks.
  const timingScaleRef = useRef(new Map<string, number>())

  const elapsed = () => {
    const clock = clockRef.current
    return (clock.pausedAt ?? performance.now()) - clock.startedAt - clock.pausedTotal
  }

  const startGap = (ms: number, next: () => void) => {
    const gap: Gap = { timer: 0, remaining: ms, startedAt: performance.now(), next }
    gap.timer = window.setTimeout(() => {
      gapRef.current = null
      next()
    }, ms)
    gapRef.current = gap
  }

  const clearTimers = () => {
    cancelAnimationFrame(rafRef.current)
    if (gapRef.current) clearTimeout(gapRef.current.timer)
    gapRef.current = null
  }

  const settle = (finished: boolean) => {
    settleRef.current?.(finished)
    settleRef.current = null
  }

  const stop = useCallback(() => {
    if (!speechSupported) return
    settle(false)
    runRef.current++
    clearTimers()
    speechSynthesis.cancel()
    utteranceRef.current = null
    setState(IDLE)
  }, [])

  /** Speaks the segments; resolves true when they all finish, false if stopped or replaced. */
  const speak = useCallback((segments: Segment[], words: Word[], options: SpeakOptions): Promise<boolean> => {
    if (!speechSupported || segments.length === 0) return Promise.resolve(false)
    settle(false)
    const done = new Promise<boolean>((resolve) => {
      settleRef.current = resolve
    })
    const run = ++runRef.current
    const isStale = () => run !== runRef.current
    clearTimers()
    speechSynthesis.cancel()
    const voiceKey = options.voice?.voiceURI ?? ''

    const speakAt = (i: number) => {
      if (isStale()) return
      if (i >= segments.length) {
        utteranceRef.current = null
        setState(IDLE)
        settle(true)
        return
      }

      const segment = segments[i]
      const isLast = i === segments.length - 1
      const utterance = new SpeechSynthesisUtterance(segment.text)
      if (options.voice) {
        utterance.voice = options.voice
        utterance.lang = options.voice.lang
      } else {
        utterance.lang = 'en-GB'
      }
      utterance.rate = options.rate
      utterance.pitch = options.pitch

      const scale = timingScaleRef.current.get(voiceKey) ?? 1
      const timeline = estimateTimeline(words, segment, options.rate, scale)
      let hasBoundaries = false
      let shownWord = -1

      const showWord = (index: number) => {
        if (index === shownWord) return
        shownWord = index
        const wordMs = (wordTiming(words[index].text).speakMs / options.rate) * scale
        const wordKey = ++wordKeyRef.current
        setState((s) => ({ ...s, wordIndex: index, wordKey, wordMs }))
      }

      const tick = () => {
        if (isStale() || hasBoundaries) return
        const t = elapsed()
        const k = timeline.findIndex((end) => t < end)
        showWord(segment.firstWord + (k === -1 ? timeline.length - 1 : k))
        rafRef.current = requestAnimationFrame(tick)
      }

      utterance.onstart = () => {
        if (isStale()) return
        clockRef.current = { startedAt: performance.now(), pausedAt: null, pausedTotal: 0 }
        setState((s) => ({ ...s, segment, wordIndex: null, step: i + 1, yourTurn: false }))
        rafRef.current = requestAnimationFrame(tick)
      }
      utterance.onboundary = (event) => {
        if (isStale() || (event.name && event.name !== 'word')) return
        hasBoundaries = true
        cancelAnimationFrame(rafRef.current)
        showWord(wordAt(words, segment.offset + event.charIndex, segment))
      }
      utterance.onend = () => {
        if (isStale()) return
        cancelAnimationFrame(rafRef.current)
        const spokenMs = elapsed()

        if (!hasBoundaries && spokenMs > 300) {
          // Move the estimate halfway towards what this voice actually took.
          const estimatedMs = timeline[timeline.length - 1]
          timingScaleRef.current.set(voiceKey, clamp(scale * (0.5 + (0.5 * spokenMs) / estimatedMs), 0.4, 2.5))
        }

        if (options.repeatAfterMe) {
          // Roughly the time it takes to say the line back, plus a moment to start.
          setState((s) => ({ ...s, wordIndex: null, yourTurn: true }))
          startGap(clamp(spokenMs * 1.3 + 900, 1800, 15000), () => speakAt(i + 1))
        } else if (isLast) {
          speakAt(i + 1)
        } else {
          setState((s) => ({ ...s, wordIndex: null }))
          startGap(options.pauseMs, () => speakAt(i + 1))
        }
      }
      utterance.onerror = (event) => {
        if (isStale() || event.error === 'interrupted' || event.error === 'canceled') return
        console.warn('Speech error:', event.error)
        cancelAnimationFrame(rafRef.current)
        speakAt(i + 1)
      }

      utteranceRef.current = utterance
      speechSynthesis.speak(utterance)
    }

    setState({ ...IDLE, status: 'speaking', segment: segments[0], step: 1, total: segments.length })
    // Chrome sometimes drops an utterance queued in the same tick as `cancel()`.
    startGap(50, () => speakAt(0))
    return done
  }, [])

  const pause = useCallback(() => {
    if (!speechSupported) return
    const gap = gapRef.current
    if (gap) {
      clearTimeout(gap.timer)
      gap.remaining -= performance.now() - gap.startedAt
    } else {
      speechSynthesis.pause()
      clockRef.current.pausedAt = performance.now()
    }
    setState((s) => (s.status === 'speaking' ? { ...s, status: 'paused' } : s))
  }, [])

  const resume = useCallback(() => {
    if (!speechSupported) return
    const gap = gapRef.current
    if (gap) {
      gap.startedAt = performance.now()
      gap.timer = window.setTimeout(() => {
        gapRef.current = null
        gap.next()
      }, Math.max(0, gap.remaining))
    } else {
      speechSynthesis.resume()
      const clock = clockRef.current
      if (clock.pausedAt !== null) {
        clock.pausedTotal += performance.now() - clock.pausedAt
        clock.pausedAt = null
      }
    }
    setState((s) => (s.status === 'paused' ? { ...s, status: 'speaking' } : s))
  }, [])

  useEffect(() => stop, [stop])

  return { state, speak, stop, pause, resume }
}
