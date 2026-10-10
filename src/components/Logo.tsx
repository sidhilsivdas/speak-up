import { wordColor } from '../lib/colors'

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className="grid size-12 -rotate-6 place-items-center rounded-2xl bg-violet-500 text-white shadow-lg shadow-violet-300"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} className="size-6">
          <path strokeLinecap="round" d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2" />
        </svg>
      </span>
      <h1 className="font-display text-3xl font-bold tracking-tight" aria-label="Speak Up!">
        {Array.from('Speak Up!').map((ch, i) => (
          <span key={i} aria-hidden className={ch === ' ' ? '' : wordColor(i)}>
            {ch}
          </span>
        ))}
      </h1>
    </div>
  )
}
