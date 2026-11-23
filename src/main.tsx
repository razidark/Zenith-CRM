import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './i18n'
import { CRMProvider } from './context/CRMProvider'
import { ToastProvider } from './context/ToastContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ToastContainer } from './components/ToastContainer'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <CRMProvider>
        <ToastProvider>
          <App />
          <ToastContainer />
        </ToastProvider>
      </CRMProvider>
    </ErrorBoundary>
  </StrictMode>,
)