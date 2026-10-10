import type { Mode } from '../lib/segments'

const MODES: { id: Mode; emoji: string; title: string; description: string; badge: string }[] = [
  { id: 'listen', emoji: '👂', title: 'Listen', description: 'Hear each sentence, then say it', badge: 'bg-sky-100' },
  { id: 'build', emoji: '🧱', title: 'Build up', description: 'One more word each time', badge: 'bg-pink-100' },
  { id: 'fluent', emoji: '🚀', title: 'Fluently', description: 'The whole line, five times', badge: 'bg-amber-100' },
]

interface Props {
  activeMode: Mode | null
  disabled: boolean
  onPlay: (mode: Mode) => void
}

export function ModePicker({ activeMode, disabled, onPlay }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {MODES.map((mode) => {
        const active = mode.id === activeMode
        return (
          <button
            key={mode.id}
            type="button"
            disabled={disabled}
            onClick={() => onPlay(mode.id)}
            aria-pressed={active}
            className={[
              'group flex items-center gap-3 rounded-3xl border-2 border-b-[6px] p-4 text-left transition-all duration-150',
              'hover:-translate-y-0.5 active:translate-y-1 active:border-b-2',
              'focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-violet-300',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0',
              active
                ? 'border-violet-600 bg-violet-500 text-white'
                : 'border-violet-200 bg-white text-violet-950 hover:border-violet-400',
            ].join(' ')}
          >
            <span
              aria-hidden
              className={[
                'grid size-12 shrink-0 place-items-center rounded-2xl text-2xl group-hover:animate-wiggle',
                active ? 'bg-white/25' : mode.badge,
              ].join(' ')}
            >
              {mode.emoji}
            </span>
            <span>
              <span className="block font-display text-lg font-semibold">{mode.title}</span>
              <span className={`block text-sm font-semibold ${active ? 'text-violet-100' : 'text-violet-400'}`}>
                {mode.description}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
