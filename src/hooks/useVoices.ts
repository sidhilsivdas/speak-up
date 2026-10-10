import { useEffect, useState } from 'react'
import { rankVoices } from '../lib/voices'

export const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

/**
 * Chrome loads voices asynchronously, so `getVoices()` is often empty on first call.
 * Re-read the list whenever the browser reports it has changed. Best voices come first.
 */
export function useVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() =>
    speechSupported ? rankVoices(speechSynthesis.getVoices()) : [],
  )

  useEffect(() => {
    if (!speechSupported) return
    const update = () => setVoices(rankVoices(speechSynthesis.getVoices()))
    update()
    speechSynthesis.addEventListener('voiceschanged', update)
    return () => speechSynthesis.removeEventListener('voiceschanged', update)
  }, [])

  return voices
}
