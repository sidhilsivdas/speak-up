import { useMemo, useRef, useState } from 'react'
import { BuddyPanel } from './components/BuddyPanel'
import type { AvatarMood } from './components/buddies/shared'
import { Logo } from './components/Logo'
import { MODES, ModePicker } from './components/ModePicker'
import { ScriptDialog, type Script } from './components/ScriptDialog'
import { Stage } from './components/Stage'
import { VoiceSettings } from './components/VoiceSettings'
import { useSpeech } from './hooks/useSpeech'
import { useStoredState } from './hooks/useStoredState'
import { speechSupported, useVoices } from './hooks/useVoices'
import { buildSegments, tokenize, type Mode } from './lib/segments'
import { isEnglish } from './lib/voices'

const DEFAULT_SCRIPT: Script = {
  text: 'I will practice English speaking like this every day.',
  source: '',
  scene: '',
}

const STEP_LABEL: Record<Mode, string> = {
  listen: 'Sentence',
  build: 'Step',
  fluent: 'Part',
}

/** The order "Play all" runs the modes in, and the break between them. */
const PLAY_ALL: Mode[] = ['listen', 'build', 'fluent']
const PLAY_ALL_BREAK_MS = 1500

const modeLabel = (mode: Mode) => {
  const info = MODES.find((m) => m.id === mode)!
  return `${info.emoji} ${info.title}`
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const BUBBLES = [
  'top-[-4rem] left-[-3rem] size-56 bg-violet-200',
  'top-1/3 right-[-5rem] size-72 bg-pink-100 [animation-delay:-2s]',
  'bottom-[-4rem] left-1/4 size-64 bg-sky-100 [animation-delay:-4s]',
]

export default function App() {
  const [script, setScript] = useStoredState<Script>('speak-up:script', DEFAULT_SCRIPT)
  const [voiceURI, setVoiceURI] = useStoredState('speak-up:voice', '')
  const [rate, setRate] = useStoredState('speak-up:pace', 0.9)
  const [pitch, setPitch] = useStoredState('speak-up:pitch', 1)
  const [repeatAfterMe, setRepeatAfterMe] = useStoredState('speak-up:repeat', true)
  const [dialogOpen, setDialogOpen] = useState(() => script === DEFAULT_SCRIPT)
  const [mode, setMode] = useState<Mode | null>(null)
  const [playingAll, setPlayingAll] = useState(false)
  // Bumped whenever something else takes over, so a running "Play all" knows to stop.
  const sequenceRef = useRef(0)

  const voices = useVoices()
  const autoVoice = voices.find(isEnglish) ?? null
  const { state, speak, stop } = useSpeech()
  const words = useMemo(() => tokenize(script.text), [script.text])
  const busy = state.status !== 'idle'

  const play = (next: Mode) => {
    setMode(next)
    return speak(buildSegments(next, script.text, words), words, {
      voice: voices.find((v) => v.voiceURI === voiceURI) ?? autoVoice,
      rate,
      pitch,
      repeatAfterMe: repeatAfterMe && next !== 'fluent',
      pauseMs: next === 'fluent' ? 700 : 450,
    })
  }

  const cancelPlayAll = () => {
    sequenceRef.current++
    setPlayingAll(false)
  }

  const playOne = (next: Mode) => {
    cancelPlayAll()
    play(next)
  }

  const playAll = async () => {
    const sequence = ++sequenceRef.current
    const isCurrent = () => sequence === sequenceRef.current
    setPlayingAll(true)
    for (const [i, next] of PLAY_ALL.entries()) {
      if (i > 0) {
        // Show what's coming during the short break between parts.
        setMode(next)
        await sleep(PLAY_ALL_BREAK_MS)
        if (!isCurrent()) return
      }
      const finished = await play(next)
      if (!isCurrent()) return
      if (!finished) break
    }
    setPlayingAll(false)
  }

  const saveScript = (next: Script) => {
    cancelPlayAll()
    stop()
    setScript(next)
    setDialogOpen(false)
  }

  const avatarMood: AvatarMood = !busy
    ? 'idle'
    : state.status === 'paused'
      ? 'paused'
      : state.yourTurn
        ? 'listening'
        : state.wordIndex !== null
          ? 'talking'
          : 'idle'
  const credit = [script.source, script.scene].filter(Boolean).join(' · ')
  const progress = state.total ? (state.step / state.total) * 100 : 0

  return (
    <div className="relative min-h-dvh overflow-hidden bg-white text-violet-950">
      <div aria-hidden className="pointer-events-none fixed inset-0">
        {BUBBLES.map((bubble) => (
          <div key={bubble} className={`absolute animate-float rounded-full opacity-70 blur-2xl ${bubble}`} />
        ))}
      </div>

      <div className="relative mx-auto flex min-h-dvh max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
        <header className="flex items-center justify-between gap-4">
          <Logo />
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            aria-label="Change line"
            title="Change line"
            className="grid size-11 place-items-center rounded-full border-2 border-b-4 border-violet-200 bg-white text-xl transition hover:border-violet-400 active:translate-y-0.5 active:border-b-2"
          >
            <span aria-hidden>✏️</span>
          </button>
        </header>

        <p className="max-w-xl font-semibold text-violet-500">
          Speak like a kid first 🧸 One minute every day ⏱️ Soon you'll speak like a pro! 🚀
        </p>

        {!speechSupported && (
          <p role="alert" className="rounded-3xl border-2 border-pink-200 bg-pink-50 p-4 font-semibold text-pink-700">
            😢 This browser can't talk yet. Try a recent version of Chrome, Edge, Safari or Firefox.
          </p>
        )}

        <main className="flex flex-col gap-6">
          <section className="relative rounded-[2.5rem] border-4 border-violet-100 bg-white/95 p-6 shadow-xl shadow-violet-200/60 sm:p-10">
            {credit && (
              <p className="mb-5 inline-block rounded-full bg-violet-100 px-4 py-1 text-sm font-extrabold tracking-wide text-violet-600">
                🎬 {credit}
              </p>
            )}
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
              <div className="w-44 shrink-0 sm:w-52">
                <BuddyPanel
                  className="w-full"
                  buddyId="leo"
                  mood={avatarMood}
                  word={state.wordIndex !== null ? words[state.wordIndex].text : null}
                  wordKey={state.wordKey}
                  wordMs={state.wordMs}
                  turnKey={state.step}
                />
              </div>
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <Stage words={words} segment={state.segment} wordIndex={state.wordIndex} />
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              {busy && (
                <div className="h-3 overflow-hidden rounded-full bg-violet-100">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-pink-400 via-violet-500 to-sky-400 transition-[width] duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
              <div className="flex min-h-10 flex-wrap items-center justify-between gap-3">
                <p aria-live="polite" className="flex items-center gap-2 font-bold text-violet-400">
                  {busy && mode ? (
                    <>
                      <span>
                        {modeLabel(mode)} · {STEP_LABEL[mode]} {state.step} of {state.total}
                        {state.status === 'paused' && ' · paused'}
                      </span>
                      {state.yourTurn && state.status !== 'paused' && (
                        <span className="flex items-center gap-1.5 rounded-full bg-pink-500 px-3 py-1 text-sm text-white shadow-md shadow-pink-200">
                          <span aria-hidden className="inline-block animate-bounce">
                            🎤
                          </span>
                          Your turn! Say it out loud
                        </span>
                      )}
                    </>
                  ) : playingAll && mode ? (
                    <span className="animate-pulse text-violet-500">Get ready: {modeLabel(mode)}…</span>
                  ) : null}
                </p>
              </div>
            </div>
          </section>

          <ModePicker
            activeMode={busy || playingAll ? mode : null}
            playingAll={playingAll}
            disabled={!speechSupported || words.length === 0}
            onPlay={playOne}
            onPlayAll={playAll}
          />
        </main>

        <footer className="mt-auto rounded-[2rem] border-2 border-violet-100 bg-white/90 p-5 sm:p-6">
          <VoiceSettings
            voices={voices}
            autoVoice={autoVoice}
            voiceURI={voiceURI}
            rate={rate}
            pitch={pitch}
            repeatAfterMe={repeatAfterMe}
            onVoiceChange={setVoiceURI}
            onRateChange={setRate}
            onPitchChange={setPitch}
            onRepeatAfterMeChange={setRepeatAfterMe}
          />
        </footer>
      </div>

      <ScriptDialog open={dialogOpen} script={script} onSave={saveScript} onClose={() => setDialogOpen(false)} />
    </div>
  )
}
