/* © 2026 JSM VALOR. All Rights Reserved. */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import RootApp from './RootApp.jsx'
import GlobalErrorBoundary from './Shared/components/GlobalErrorBoundary'
import { NotificationProvider } from './Shared/context/NotificationContext'

import { HelmetProvider } from 'react-helmet-async'
import * as Sentry from "@sentry/react";


if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 0.1, 
    replaysSessionSampleRate: 0.1, 
    replaysOnErrorSampleRate: 1.0 
  });
}



// Global Security Protections
document.addEventListener('contextmenu', event => {
  if (event.target.tagName === 'IMG' || event.target.closest('.profile-photo')) {
    event.preventDefault();
  }
});
document.addEventListener('keydown', (e) => {
  // Prevent Save As (Ctrl+S, Cmd+S), Print (Ctrl+P, Cmd+P)
  if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p')) {
    e.preventDefault();
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
        <BrowserRouter>
      <NotificationProvider>
        <GlobalErrorBoundary>
          <RootApp />
        </GlobalErrorBoundary>
      </NotificationProvider>
      <Analytics />
    </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
