import { useEffect, useState } from 'react'
import { Download, Share, X } from 'lucide-react'

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

export default function PWAInstall() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null)
  const [showIOSHelp, setShowIOSHelp] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
    setInstalled(isStandalone)
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isSafari = /safari/i.test(navigator.userAgent) && !/crios|fxios|edgios/i.test(navigator.userAgent)
    setShowIOSHelp(isIOS && isSafari && !isStandalone)
    const onBeforeInstall = (event: Event) => { event.preventDefault(); setInstallEvent(event as InstallPromptEvent) }
    const onInstalled = () => { setInstalled(true); setInstallEvent(null); setShowIOSHelp(false) }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => { window.removeEventListener('beforeinstallprompt', onBeforeInstall); window.removeEventListener('appinstalled', onInstalled) }
  }, [])

  if (installed || dismissed || (!installEvent && !showIOSHelp)) return null

  const install = async () => {
    if (!installEvent) return
    await installEvent.prompt()
    const choice = await installEvent.userChoice
    if (choice.outcome === 'accepted') setInstallEvent(null)
  }

  return <aside className="install-banner" aria-label="Instalar FitLife">
    <div className="install-icon"><Download size={19}/></div>
    <div className="install-copy">
      <strong>Tenha o FitLife no seu celular</strong>
      {showIOSHelp ? <span>No Safari, toque em Compartilhar e depois em “Adicionar à Tela de Início”.</span> : <span>Instale para abrir como aplicativo.</span>}
    </div>
    {installEvent && <button className="install-action" onClick={install}>Instalar</button>}
    {showIOSHelp && <span className="share-hint" aria-hidden="true"><Share size={17}/></span>}
    <button className="install-close" onClick={() => setDismissed(true)} aria-label="Fechar aviso"><X size={17}/></button>
  </aside>
}
