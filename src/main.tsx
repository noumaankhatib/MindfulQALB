import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// In development, suppress known noisy console messages from third-party scripts/extensions
if (import.meta.env.DEV) {
  const origWarn = console.warn
  console.warn = (...args: unknown[]) => {
    const msg = args[0] != null ? String(args[0]) : ''
    if (
      msg.includes('React Router Future Flag') ||
      msg.includes('v7_startTransition') ||
      msg.includes('DEFAULT root logger') ||
      msg.includes("Using DEFAULT root logger")
    ) {
      return
    }
    origWarn.apply(console, args)
  }
  const origError = console.error
  console.error = (...args: unknown[]) => {
    const msg = args[0] != null ? String(args[0]) : ''
    if (
      msg.includes('listener indicated an asynchronous response') ||
      msg.includes('message channel closed')
    ) {
      return
    }
    origError.apply(console, args)
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

