import { lazy } from 'react'
import { Leo } from './Leo'

export const BUDDIES = {
  leo: { name: 'Leo', Component: Leo },
  // Not shown at the moment, so kept out of the main bundle and loaded only if picked.
  pip: { name: 'Pip', Component: lazy(() => import('./Pip').then((m) => ({ default: m.Pip }))) },
}

export type BuddyId = keyof typeof BUDDIES
