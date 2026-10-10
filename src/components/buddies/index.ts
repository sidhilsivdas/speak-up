import { Leo } from './Leo'
import { Pip } from './Pip'

export const BUDDIES = {
  leo: { name: 'Leo', Component: Leo },
  pip: { name: 'Pip', Component: Pip },
}

export type BuddyId = keyof typeof BUDDIES
