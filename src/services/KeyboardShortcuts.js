class KeyboardShortcuts {
  constructor() {
    this.shortcuts = new Map();
    this.isEnabled = true;
    this.init();
  }

  init() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    // Registrar atalhos padrão
    this.registerDefaultShortcuts();
  }

  registerDefaultShortcuts() {
    // Navegação
    this.register('ctrl+shift+h', () => {
      window.location.hash = '#/home';
    }, 'Ir para Home');

    this.register('ctrl+shift+d', () => {
      window.location.hash = '#/dashboard';
    }, 'Ir para Dashboard');

    // Módulos principais
    this.register('ctrl+1', () => {
      window.location.hash = '#/habitos';
    }, 'Ir para Hábitos');

    this.register('ctrl+3', () => {
      window.location.hash = '#/financas';
    }, 'Ir para Finanças');

    this.register('ctrl+4', () => {
      window.location.hash = '#/saude';
    }, 'Ir para Saúde');

    this.register('ctrl+5', () => {
      window.location.hash = '#/leituras';
    }, 'Ir para Leituras');

    this.register('ctrl+6', () => {
      window.location.hash = '#/projetos';
    }, 'Ir para Projetos');

    // Funcionalidades
    this.register('ctrl+shift+t', () => {
      this.toggleTheme();
    }, 'Alternar Tema');

    this.register('ctrl+shift+a', () => {
      this.openAccessibilityMenu();
    }, 'Menu de Acessibilidade');

    this.register('ctrl+shift+s', () => {
      this.openSearch();
    }, 'Busca Global');

    this.register('ctrl+shift+n', () => {
      this.createNewItem();
    }, 'Criar Novo Item');

    this.register('escape', () => {
      this.closeModals();
    }, 'Fechar Modais');

    this.register('ctrl+shift+slash', () => {
      this.showShortcutsHelp();
    }, 'Mostrar Atalhos');

    // Acessibilidade
    this.register('alt+1', () => {
      this.focusMainContent();
    }, 'Focar Conteúdo Principal');

    this.register('alt+2', () => {
      this.focusNavigation();
    }, 'Focar Navegação');

    this.register('ctrl+plus', () => {
      this.increaseFontSize();
    }, 'Aumentar Fonte');

    this.register('ctrl+minus', () => {
      this.decreaseFontSize();
    }, 'Diminuir Fonte');
  }

  register(shortcut, callback, description) {
    const normalizedShortcut = this.normalizeShortcut(shortcut);
    this.shortcuts.set(normalizedShortcut, {
      callback,
      description,
      shortcut: shortcut
    });
  }

  unregister(shortcut) {
    const normalizedShortcut = this.normalizeShortcut(shortcut);
    this.shortcuts.delete(normalizedShortcut);
  }

  normalizeShortcut(shortcut) {
    return shortcut.toLowerCase()
      .replace(/\s+/g, '')
      .split('+')
      .sort()
      .join('+');
  }

  handleKeyDown(event) {
    if (!this.isEnabled) return;

    // Ignorar se estiver digitando em inputs
    if (this.isTyping(event.target)) return;

    const shortcut = this.getShortcutString(event);
    const command = this.shortcuts.get(shortcut);

    if (command) {
      event.preventDefault();
      command.callback();
      
      // Analytics
      if (window.AnalyticsService) {
        window.AnalyticsService.trackFeatureUsage('keyboard_shortcut', {
          shortcut: command.shortcut,
          description: command.description
        });
      }
    }
  }

  getShortcutString(event) {
    const keys = [];
    
    if (event.ctrlKey) keys.push('ctrl');
    if (event.altKey) keys.push('alt');
    if (event.shiftKey) keys.push('shift');
    if (event.metaKey) keys.push('meta');
    
    const key = event.key.toLowerCase();
    if (key !== 'control' && key !== 'alt' && key !== 'shift' && key !== 'meta') {
      keys.push(key === ' ' ? 'space' : key);
    }
    
    return keys.sort().join('+');
  }

  isTyping(element) {
    const typingElements = ['input', 'textarea', 'select'];
    const isContentEditable = element.contentEditable === 'true';
    const isTypingElement = typingElements.includes(element.tagName.toLowerCase());
    
    return isContentEditable || isTypingElement;
  }

  // Implementações das funcionalidades
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    
    this.showToast(`Tema alterado para ${newTheme === 'dark' ? 'escuro' : 'claro'}`);
  }

  openAccessibilityMenu() {
    // Criar menu de acessibilidade dinâmico
    const menu = this.createAccessibilityMenu();
    document.body.appendChild(menu);
    menu.querySelector('button').focus();
  }

  createAccessibilityMenu() {
    const menu = document.createElement('div');
    menu.className = 'accessibility-menu';
    menu.innerHTML = `
      <div class="accessibility-menu-content">
        <h3>Menu de Acessibilidade</h3>
        <button onclick="keyboardShortcuts.increaseFontSize()">Aumentar Fonte</button>
        <button onclick="keyboardShortcuts.decreaseFontSize()">Diminuir Fonte</button>
        <button onclick="keyboardShortcuts.toggleHighContrast()">Alto Contraste</button>
        <button onclick="keyboardShortcuts.toggleAnimations()">Pausar Animações</button>
        <button onclick="keyboardShortcuts.closeAccessibilityMenu()">Fechar</button>
      </div>
    `;
    
    // Estilo inline para garantir visibilidade
    menu.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 2px solid #000;
      padding: 1rem;
      z-index: 10000;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    
    return menu;
  }

  closeAccessibilityMenu() {
    const menu = document.querySelector('.accessibility-menu');
    if (menu) {
      menu.remove();
    }
  }

  openSearch() {
    // Implementar busca global
    const searchInput = document.querySelector('#global-search');
    if (searchInput) {
      searchInput.focus();
    } else {
      this.showToast('Busca global não disponível nesta página');
    }
  }

  createNewItem() {
    // Detectar contexto atual e criar item apropriado
    const currentPath = window.location.hash;
    
    if (currentPath.includes('habitos')) {
      this.dispatchEvent('create-habit');
    } else if (currentPath.includes('projetos')) {
      this.dispatchEvent('create-project');
    } else if (currentPath.includes('leituras')) {
      this.dispatchEvent('create-reading');
    } else {
      this.showToast('Criação rápida não disponível nesta página');
    }
  }

  dispatchEvent(eventName, data = {}) {
    const event = new CustomEvent(eventName, { detail: data });
    document.dispatchEvent(event);
  }

  closeModals() {
    // Fechar todos os modais abertos
    const modals = document.querySelectorAll('.modal, .overlay, [role="dialog"]');
    modals.forEach(modal => {
      if (modal.style.display !== 'none') {
        const closeBtn = modal.querySelector('.close, [aria-label*="fechar"], [aria-label*="close"]');
        if (closeBtn) {
          closeBtn.click();
        } else {
          modal.style.display = 'none';
        }
      }
    });
  }

  focusMainContent() {
    const main = document.querySelector('main, [role="main"], .main-content');
    if (main) {
      main.focus();
      main.scrollIntoView({ behavior: 'smooth' });
    }
  }

  focusNavigation() {
    const nav = document.querySelector('nav, [role="navigation"], .navigation');
    if (nav) {
      const firstLink = nav.querySelector('a, button');
      if (firstLink) {
        firstLink.focus();
      }
    }
  }

  increaseFontSize() {
    const currentSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const newSize = Math.min(currentSize + 2, 24);
    document.documentElement.style.fontSize = newSize + 'px';
    this.showToast(`Fonte aumentada para ${newSize}px`);
    
    localStorage.setItem('learnhub-font-size', newSize);
  }

  decreaseFontSize() {
    const currentSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const newSize = Math.max(currentSize - 2, 12);
    document.documentElement.style.fontSize = newSize + 'px';
    this.showToast(`Fonte diminuída para ${newSize}px`);
    
    localStorage.setItem('learnhub-font-size', newSize);
  }

  toggleHighContrast() {
    document.body.classList.toggle('high-contrast');
    const isEnabled = document.body.classList.contains('high-contrast');
    this.showToast(`Alto contraste ${isEnabled ? 'ativado' : 'desativado'}`);
    
    localStorage.setItem('learnhub-high-contrast', isEnabled);
  }

  toggleAnimations() {
    document.body.classList.toggle('reduced-motion');
    const isReduced = document.body.classList.contains('reduced-motion');
    this.showToast(`Animações ${isReduced ? 'pausadas' : 'ativadas'}`);
    
    localStorage.setItem('learnhub-reduced-motion', isReduced);
  }

  showShortcutsHelp() {
    const helpModal = this.createShortcutsHelpModal();
    document.body.appendChild(helpModal);
    helpModal.querySelector('button').focus();
  }

  createShortcutsHelpModal() {
    const modal = document.createElement('div');
    modal.className = 'shortcuts-help-modal';
    
    const shortcutsList = Array.from(this.shortcuts.entries())
      .map(([key, command]) => `
        <tr>
          <td><kbd>${command.shortcut}</kbd></td>
          <td>${command.description}</td>
        </tr>
      `).join('');
    
    modal.innerHTML = `
      <div class="shortcuts-help-content">
        <h3>Atalhos de Teclado</h3>
        <table>
          <thead>
            <tr>
              <th>Atalho</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            ${shortcutsList}
          </tbody>
        </table>
        <button onclick="this.closest('.shortcuts-help-modal').remove()">Fechar</button>
      </div>
    `;
    
    // Estilo inline
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    
    const content = modal.querySelector('.shortcuts-help-content');
    content.style.cssText = `
      background: white;
      padding: 2rem;
      border-radius: 8px;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
    `;
    
    return modal;
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'keyboard-shortcut-toast';
    toast.textContent = message;
    
    toast.style.cssText = `
      position: fixed;
      top: 2rem;
      right: 2rem;
      background: var(--color-primary, #8B5CF6);
      color: white;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      z-index: 10000;
      animation: slideInToast 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  // Restaurar preferências salvas
  restorePreferences() {
    // Fonte
    const savedFontSize = localStorage.getItem('learnhub-font-size');
    if (savedFontSize) {
      document.documentElement.style.fontSize = savedFontSize + 'px';
    }
    
    // Alto contraste
    const highContrast = localStorage.getItem('learnhub-high-contrast') === 'true';
    if (highContrast) {
      document.body.classList.add('high-contrast');
    }
    
    // Animações reduzidas
    const reducedMotion = localStorage.getItem('learnhub-reduced-motion') === 'true';
    if (reducedMotion) {
      document.body.classList.add('reduced-motion');
    }
  }
}

// CSS para animações dos toasts
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInToast {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  kbd {
    background: #f1f1f1;
    border: 1px solid #ccc;
    border-radius: 3px;
    padding: 2px 6px;
    font-family: monospace;
    font-size: 0.875em;
  }
  
  .shortcuts-help-modal table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
  }
  
  .shortcuts-help-modal th,
  .shortcuts-help-modal td {
    padding: 0.5rem;
    border: 1px solid #ddd;
    text-align: left;
  }
  
  .shortcuts-help-modal th {
    background: #f5f5f5;
    font-weight: bold;
  }
`;
document.head.appendChild(style);

// Instância global
const keyboardShortcuts = new KeyboardShortcuts();

// Restaurar preferências ao carregar
document.addEventListener('DOMContentLoaded', () => {
  keyboardShortcuts.restorePreferences();
});

export default keyboardShortcuts;
