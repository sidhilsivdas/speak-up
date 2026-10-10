import { useEffect, useState } from 'react'

// Storage can throw (private mode, blocked site data), so access it only through these.
function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

function writeStored(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Keep the value for this session only.
  }
}

/** useState that remembers its value in localStorage, and still works when storage is unavailable. */
export function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => readStored(key, initial))

  useEffect(() => {
    writeStored(key, value)
  }, [key, value])

  return [value, setValue] as const
}
