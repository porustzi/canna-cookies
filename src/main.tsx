import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/space-grotesk'
import '@fontsource-variable/manrope'
import './styles/index.css'
import App from './App'
import { parseLang } from './i18n'

const lang = parseLang(window.location.pathname)

try {
  localStorage.setItem('cc_lang', lang)
} catch {
  /* storage unavailable — root redirect will fall back to navigator.language */
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App initialLang={lang} />
  </StrictMode>,
)
