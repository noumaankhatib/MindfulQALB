import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Suppress known noisy console messages from third-party scripts and browser extensions
const stringifyArgs = (args: unknown[]) => args.map((a) => (a != null ? String(a) : '')).join(' ')

const origError = console.error
console.error = (...args: unknown[]) => {
  const msg = stringifyArgs(args)
  if (
    msg.includes('listener indicated') ||
    msg.includes('asynchronous response') ||
    msg.includes('message channel closed') ||
    msg.includes('message channel')
  ) {
    return
  }
  origError.apply(console, args)
}

if (import.meta.env.DEV) {
  const origWarn = console.warn
  console.warn = (...args: unknown[]) => {
    const msg = stringifyArgs(args)
    if (
      msg.includes('React Router Future Flag') ||
      msg.includes('v7_startTransition') ||
      msg.includes('DEFAULT root logger') ||
      msg.includes('Using DEFAULT root logger') ||
      msg.includes('[DEFAULT]')
    ) {
      return
    }
    origWarn.apply(console, args)
  }
}

// Suppress unhandled promise rejections from browser extensions (Chrome "message channel closed" etc.)
function isExtensionRejection(ev: PromiseRejectionEvent): boolean {
  const msg =
    (ev.reason && typeof ev.reason === 'object' && 'message' in ev.reason
      ? String((ev.reason as { message?: unknown }).message)
      : '') || String(ev.reason ?? '')
  return (
    msg.includes('asynchronous response') ||
    msg.includes('message channel closed') ||
    msg.includes('message channel')
  )
}
window.addEventListener(
  'unhandledrejection',
  (ev) => {
    if (isExtensionRejection(ev)) {
      ev.preventDefault()
      ev.stopImmediatePropagation()
    }
  },
  true
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

