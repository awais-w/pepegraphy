import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ContentProvider } from './context/ContentContext.jsx'
import { LanguageProvider } from './i18n/LanguageContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <ContentProvider>
        <App />
      </ContentProvider>
    </LanguageProvider>
  </StrictMode>,
)
