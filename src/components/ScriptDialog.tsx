import { useEffect, useRef, useState, type FormEvent } from 'react'

export interface Script {
  text: string
  source: string
  scene: string
}

interface Props {
  open: boolean
  script: Script
  onSave: (script: Script) => void
  onClose: () => void
}

const inputClass =
  'w-full rounded-2xl border-2 border-violet-200 bg-white px-4 py-2.5 font-semibold text-violet-950 placeholder:text-violet-300 ' +
  'focus:border-violet-500 focus:ring-4 focus:ring-violet-200 focus:outline-none'

export function ScriptDialog({ open, script, onSave, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [draft, setDraft] = useState(script)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      setDraft(script)
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open, script])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSave({ text: draft.text.trim(), source: draft.source.trim(), scene: draft.scene.trim() })
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="m-auto w-[min(32rem,calc(100%-2rem))] rounded-[2rem] border-4 border-violet-200 bg-white p-0 text-violet-950 shadow-2xl shadow-violet-300/50 backdrop:bg-violet-950/40 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={submit} className="flex flex-col gap-5 p-6 sm:p-7">
        <div>
          <h2 className="font-display text-3xl font-bold text-violet-700">
            <span aria-hidden>🎬 </span>Today's line
          </h2>
          <p className="mt-1 font-semibold text-violet-400">
            Paste a line from a movie, series or anything you want to say out loud.
          </p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="font-display font-semibold text-violet-900">Dialogue</span>
          <textarea
            required
            rows={4}
            value={draft.text}
            onChange={(e) => setDraft({ ...draft, text: e.target.value })}
            placeholder="I will practice English speaking like this every day."
            className={`${inputClass} resize-y`}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="font-display font-semibold text-violet-900">Source</span>
            <input
              value={draft.source}
              onChange={(e) => setDraft({ ...draft, source: e.target.value })}
              placeholder="e.g. Friends"
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-display font-semibold text-violet-900">Character or scene</span>
            <input
              value={draft.scene}
              onChange={(e) => setDraft({ ...draft, scene: e.target.value })}
              placeholder="e.g. Chandler, S1E1"
              className={inputClass}
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-2 font-bold text-violet-500 hover:bg-violet-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-full border-b-4 border-violet-700 bg-violet-500 px-6 py-2 font-display text-lg font-semibold text-white transition hover:bg-violet-600 active:translate-y-0.5 active:border-b-2 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
          >
            Let's go! ✨
          </button>
        </div>
      </form>
    </dialog>
  )
}
