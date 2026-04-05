import React, { useState, useEffect } from 'react';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsStandalone(true);
      return;
    }

    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    // Listen for beforeinstallprompt (Android / Chrome)
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show button if not already seen in this session
      if (!sessionStorage.getItem('pwa-prompt-dismissed')) {
        setShowInstallBtn(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for manual trigger
    const manualHandler = () => {
      if (ios) {
        setShowIOSModal(true);
      } else if (deferredPrompt) {
        deferredPrompt.prompt();
      } else {
        // Fallback for desktop or other browsers
        setShowIOSModal(true); 
      }
    };
    window.addEventListener('show-pwa-install-modal', manualHandler);

    // If iOS and not standalone, show button after a short delay
    if (ios && !sessionStorage.getItem('pwa-prompt-dismissed')) {
      const timer = setTimeout(() => setShowInstallBtn(true), 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('show-pwa-install-modal', manualHandler);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('show-pwa-install-modal', manualHandler);
    };
  }, [deferredPrompt, isIOS]);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      setShowInstallBtn(false);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  const dismissPrompt = (e) => {
    e.stopPropagation();
    setShowInstallBtn(false);
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // We only hide the floating persistent button, but the component must stay alive 
  // to handle the manual event 'show-pwa-install-modal'

  return (
    <>
      {showInstallBtn && !isStandalone && (
        <div className="install-btn-container">
          <button className="install-btn" onClick={handleInstallClick}>
            <span className="install-btn-icon">📲</span>
            Instalar App
            <span className="install-btn-close" onClick={dismissPrompt}>✕</span>
          </button>
        </div>
      )}

      {showIOSModal && (
        <div className="install-modal-overlay" onClick={() => setShowIOSModal(false)}>
          <div className="install-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="install-modal-header">
              <div className="install-modal-icon">🐍</div>
              <h3 className="install-modal-title">Instalar PythonGo</h3>
              <p className="theory-text">Sigue estos pasos para añadir la app a tu pantalla de inicio:</p>
            </div>

            <div className="install-modal-steps">
              {isIOS ? (
                <>
                  <div className="install-step">
                    <div className="install-step-num">1</div>
                    <div className="install-step-text">Toca el botón **Compartir** en Safari</div>
                    <div className="install-step-icon">⎋</div>
                  </div>
                  <div className="install-step">
                    <div className="install-step-num">2</div>
                    <div className="install-step-text">Desliza hacia abajo y elige **"Añadir a pantalla de inicio"**</div>
                    <div className="install-step-icon">⊕</div>
                  </div>
                </>
              ) : (
                <div className="install-step">
                  <div className="install-step-num">1</div>
                  <div className="install-step-text">Abre el menú de tu navegador (tres puntos) y elige **"Añadir a pantalla de inicio"** o **"Instalar aplicación"**.</div>
                  <div className="install-step-icon">⋮</div>
                </div>
              )}
              <div className="install-step" style={{ marginTop: 10, cursor: 'pointer' }} onClick={() => {
                navigator.clipboard.writeText(window.location.host);
                alert('¡Enlace copiado! Ábrelo en tu navegador para instalar.');
              }}>
                <div className="install-step-num" style={{ background: 'var(--accent)' }}>3</div>
                <div className="install-step-text">¿No encuentras la opción? <strong>Copia el enlace de la app</strong> y pégalo en tu navegador (Safari/Chrome).</div>
                <div className="install-step-icon">📋</div>
              </div>
            </div>

            <button className="install-modal-close" onClick={() => setShowIOSModal(false)}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPWA;
