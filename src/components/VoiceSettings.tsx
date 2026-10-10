import { isEnglish, isNaturalVoice, PACE_PRESETS, wordsPerMinute } from '../lib/voices'

interface Props {
  voices: SpeechSynthesisVoice[]
  autoVoice: SpeechSynthesisVoice | null
  voiceURI: string
  rate: number
  pitch: number
  repeatAfterMe: boolean
  onVoiceChange: (voiceURI: string) => void
  onRateChange: (rate: number) => void
  onPitchChange: (pitch: number) => void
  onRepeatAfterMeChange: (on: boolean) => void
}

const rangeClass = 'h-2 w-full cursor-pointer accent-violet-500'
const labelClass = 'flex items-baseline justify-between gap-2 font-display font-semibold text-violet-900'
const valueClass = 'rounded-full bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-600'
const hintClass = 'text-xs font-semibold text-violet-400'

const chipClass = (on: boolean) =>
  [
    'rounded-full border-2 px-3 py-0.5 text-sm font-bold transition',
    on
      ? 'border-violet-500 bg-violet-500 text-white'
      : 'border-violet-200 bg-white text-violet-600 hover:border-violet-400',
  ].join(' ')

const voiceLabel = (v: SpeechSynthesisVoice) => `${isNaturalVoice(v) ? '⭐ ' : ''}${v.name} (${v.lang})`

export function VoiceSettings(props: Props) {
  const { voices, autoVoice, voiceURI, rate, pitch, repeatAfterMe } = props
  const english = voices.filter(isEnglish)
  const other = voices.filter((v) => !isEnglish(v))

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <label className="flex flex-col gap-2">
        <span className={labelClass}>🎤 Voice</span>
        <select
          value={voiceURI}
          onChange={(e) => props.onVoiceChange(e.target.value)}
          className="w-full rounded-2xl border-2 border-violet-200 bg-white px-3 py-2 text-sm font-semibold text-violet-950 focus:border-violet-500 focus:ring-4 focus:ring-violet-200 focus:outline-none"
        >
          <option value="">✨ Auto: most natural{autoVoice ? ` (${autoVoice.name})` : ''}</option>
          {english.length > 0 && (
            <optgroup label="English">
              {english.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {voiceLabel(v)}
                </option>
              ))}
            </optgroup>
          )}
          {other.length > 0 && (
            <optgroup label="Other languages">
              {other.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {voiceLabel(v)}
                </option>
              ))}
            </optgroup>
          )}
        </select>
        <span className={hintClass}>⭐ voices sound the most like a real person.</span>
      </label>

      <div className="flex flex-col gap-2">
        <label htmlFor="rate" className={labelClass}>
          ⏱️ Pace <span className={valueClass}>≈ {wordsPerMinute(rate)} words/min</span>
        </label>
        <input
          id="rate"
          type="range"
          min={0.5}
          max={1.5}
          step={0.05}
          value={rate}
          onChange={(e) => props.onRateChange(Number(e.target.value))}
          className={rangeClass}
        />
        <div className="flex flex-wrap gap-2">
          {PACE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => props.onRateChange(preset.rate)}
              aria-pressed={rate === preset.rate}
              className={chipClass(rate === preset.rate)}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <span className={hintClass}>People usually talk at about 150–160 words a minute.</span>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="pitch" className={labelClass}>
          🎵 Pitch <span className={valueClass}>{pitch === 1 ? 'Normal' : pitch.toFixed(1)}</span>
        </label>
        <input
          id="pitch"
          type="range"
          min={0.5}
          max={1.5}
          step={0.1}
          value={pitch}
          onChange={(e) => props.onPitchChange(Number(e.target.value))}
          className={rangeClass}
        />
        <div>
          <button type="button" onClick={() => props.onPitchChange(1)} className={chipClass(pitch === 1)}>
            🙂 Normal
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className={labelClass}>🗣️ Repeat after me</span>
        <button
          type="button"
          role="switch"
          aria-checked={repeatAfterMe}
          onClick={() => props.onRepeatAfterMeChange(!repeatAfterMe)}
          className="flex items-center gap-3 text-left"
        >
          <span
            className={[
              'relative h-8 w-14 shrink-0 rounded-full transition-colors',
              repeatAfterMe ? 'bg-violet-500' : 'bg-violet-200',
            ].join(' ')}
          >
            <span
              className={[
                'absolute top-1 left-1 size-6 rounded-full bg-white shadow transition-transform',
                repeatAfterMe ? 'translate-x-6' : '',
              ].join(' ')}
            />
          </span>
          <span className={hintClass}>
            Pause after each part so you can say it out loud. Fluently mode always plays straight through.
          </span>
        </button>
      </div>
    </div>
  )
}
