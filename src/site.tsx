import { createContext, useContext } from 'react'
import type { Dict, Lang } from './i18n'

export interface SiteValue {
  lang: Lang
  t: Dict
  images: { about: string | null; hero: string | null }
  switchLang: (lang: Lang) => void
  openCatalog: () => void
}

export const SiteContext = createContext<SiteValue | null>(null)

export function useSite(): SiteValue {
  const value = useContext(SiteContext)
  if (!value) throw new Error('useSite must be used inside SiteContext.Provider')
  return value
}
