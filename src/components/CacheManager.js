import React, { useState, useEffect } from 'react';
import { detectCacheIssues, fixCacheIssues, clearServiceWorkerCache } from '../utils/cacheUtils';
import './CacheManager.css';

function CacheManager() {
  const [showNotification, setShowNotification] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    // Verificar problemas de cache periodicamente
    const checkCache = () => {
      if (detectCacheIssues()) {
        setShowNotification(true);
      }
    };

    checkCache();
    const interval = setInterval(checkCache, 30000); // Verificar a cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await fixCacheIssues();
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      // Fallback: recarregar página normalmente
      window.location.reload();
    }
    setIsClearing(false);
  };

  const handleDismiss = () => {
    setShowNotification(false);
    // Não mostrar novamente por 1 hora
    localStorage.setItem('cache_notification_dismissed', Date.now().toString());
  };

  // Verificar se foi dispensado recentemente
  useEffect(() => {
    const dismissed = localStorage.getItem('cache_notification_dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const oneHour = 60 * 60 * 1000;
      if (Date.now() - dismissedTime < oneHour) {
        setShowNotification(false);
      }
    }
  }, []);

  if (!showNotification) {
    return null;
  }

  return (
    <div className="cache-notification">
      <div className="cache-notification-content">
        <div className="cache-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="cache-message">
          <h4>Visual Antigo Detectado</h4>
          <p>Parece que você está vendo uma versão antiga da página. Limpe o cache para ver a versão mais recente.</p>
        </div>
        <div className="cache-actions">
          <button 
            className="cache-btn cache-btn-primary" 
            onClick={handleClearCache}
            disabled={isClearing}
          >
            {isClearing ? (
              <>
                <div className="loading-spinner"></div>
                Limpando...
              </>
            ) : (
              'Limpar Cache'
            )}
          </button>
          <button 
            className="cache-btn cache-btn-secondary" 
            onClick={handleDismiss}
          >
            Dispensar
          </button>
        </div>
      </div>
      <div className="cache-tip">
        <small>💡 Dica: Use <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd> para limpar o cache rapidamente</small>
      </div>
    </div>
  );
}

export default CacheManager;