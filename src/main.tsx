
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './style.css'
import { registerSW } from 'virtual:pwa-register'

registerSW({
  immediate: true,
  onRegisterError(error: unknown) {
    console.error('Falha ao registrar o Service Worker:', error)
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
