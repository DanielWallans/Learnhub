// Utilitários para gerenciar cache do service worker

// Função para limpar todo o cache
export const clearServiceWorkerCache = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration.active) {
        // Criar um canal de comunicação
        const messageChannel = new MessageChannel();
        
        // Promessa para aguardar resposta
        const response = new Promise((resolve) => {
          messageChannel.port1.onmessage = (event) => {
            resolve(event.data);
          };
        });
        
        // Enviar mensagem para limpar cache
        registration.active.postMessage(
          { type: 'CLEAR_CACHE' },
          [messageChannel.port2]
        );
        
        await response;
        console.log('Cache limpo com sucesso!');
        return true;
      }
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      return false;
    }
  }
  return false;
};

// Função para forçar atualização do service worker
export const forceServiceWorkerUpdate = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
      
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Aguardar o novo service worker assumir controle
        await new Promise((resolve) => {
          navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true });
        });
        
        console.log('Service Worker atualizado!');
        return true;
      }
    } catch (error) {
      console.error('Erro ao atualizar service worker:', error);
      return false;
    }
  }
  return false;
};

// Função para recarregar a página sem cache
export const hardReload = () => {
  if (window.location.reload) {
    window.location.reload(true); // Força reload sem cache
  } else {
    window.location.href = window.location.href;
  }
};

// Função combinada para resolver problemas de cache
export const fixCacheIssues = async () => {
  try {
    console.log('Iniciando limpeza de cache...');
    
    // 1. Limpar cache do service worker
    await clearServiceWorkerCache();
    
    // 2. Forçar atualização do service worker
    await forceServiceWorkerUpdate();
    
    // 3. Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 4. Recarregar página
    hardReload();
    
    return true;
  } catch (error) {
    console.error('Erro ao resolver problemas de cache:', error);
    return false;
  }
};

// Função para detectar se há problemas de cache
export const detectCacheIssues = () => {
  // Verificar se há diferenças entre versões
  const currentVersion = process.env.REACT_APP_VERSION || '1.0.0';
  const cachedVersion = localStorage.getItem('app_version');
  
  if (cachedVersion && cachedVersion !== currentVersion) {
    console.warn('Versão diferente detectada:', { cached: cachedVersion, current: currentVersion });
    return true;
  }
  
  // Salvar versão atual
  localStorage.setItem('app_version', currentVersion);
  
  return false;
};

// Adicionar atalho de teclado para limpar cache (Ctrl+Shift+R)
export const setupCacheShortcuts = () => {
  document.addEventListener('keydown', (event) => {
    // Ctrl+Shift+R - Limpar cache e recarregar
    if (event.ctrlKey && event.shiftKey && event.key === 'R') {
      event.preventDefault();
      console.log('Atalho detectado: Limpando cache...');
      fixCacheIssues();
    }
    
    // Ctrl+Shift+C - Apenas limpar cache
    if (event.ctrlKey && event.shiftKey && event.key === 'C') {
      event.preventDefault();
      console.log('Atalho detectado: Limpando apenas cache...');
      clearServiceWorkerCache();
    }
  });
};