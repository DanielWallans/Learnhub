class ResponsiveTester {
  constructor() {
    this.breakpoints = {
      mobile: { min: 320, max: 767 },
      tablet: { min: 768, max: 1023 },
      desktop: { min: 1024, max: 1440 },
      widescreen: { min: 1441, max: 2560 }
    };
    
    this.results = [];
    this.originalViewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  async runAllTests() {
    this.results = [];
    
    try {
      for (const [device, dimensions] of Object.entries(this.breakpoints)) {
        await this.testBreakpoint(device, dimensions);
      }
      
      await this.testViewportMeta();
      await this.testScrollBehavior();
      await this.testTouchTargets();
      
      // Restaurar viewport original
      this.setViewportSize(this.originalViewport.width, this.originalViewport.height);
      
      return this.generateReport();
    } catch (error) {
      console.error('Erro ao executar testes de responsividade:', error);
      return { success: false, error: error.message };
    }
  }

  async testBreakpoint(device, dimensions) {
    const issues = [];
    
    // Testar diferentes larguras dentro do breakpoint
    const testWidths = [dimensions.min, Math.floor((dimensions.min + dimensions.max) / 2), dimensions.max];
    
    for (const width of testWidths) {
      this.setViewportSize(width, 800);
      await this.waitForReflow();
      
      // Verificar overflow horizontal
      const hasHorizontalScroll = document.body.scrollWidth > window.innerWidth;
      if (hasHorizontalScroll) {
        issues.push({
          width,
          issue: 'Scroll horizontal detectado',
          element: 'body'
        });
      }
      
      // Verificar elementos que saem da tela
      const elements = document.querySelectorAll('*');
      elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        if (rect.right > window.innerWidth && rect.width > 10) {
          issues.push({
            width,
            issue: 'Elemento excede largura da viewport',
            element: element.tagName.toLowerCase(),
            className: element.className,
            elementWidth: rect.width,
            viewportWidth: window.innerWidth
          });
        }
      });
      
      // Verificar texto muito pequeno
      const textElements = document.querySelectorAll('p, span, div, a, button, label');
      textElements.forEach(element => {
        const styles = window.getComputedStyle(element);
        const fontSize = parseInt(styles.fontSize);
        
        if (fontSize < 14 && device === 'mobile') {
          issues.push({
            width,
            issue: 'Texto muito pequeno para mobile',
            element: element.tagName.toLowerCase(),
            className: element.className,
            fontSize
          });
        }
      });
      
      // Verificar densidade de botões em mobile
      if (device === 'mobile') {
        const buttons = document.querySelectorAll('button, a, input[type="button"], input[type="submit"]');
        buttons.forEach(button => {
          const rect = button.getBoundingClientRect();
          if (rect.height < 44 || rect.width < 44) {
            issues.push({
              width,
              issue: 'Área de toque muito pequena (mínimo 44px)',
              element: button.tagName.toLowerCase(),
              className: button.className,
              size: `${rect.width}x${rect.height}`
            });
          }
        });
      }
    }

    this.results.push({
      test: `Responsividade - ${device}`,
      device,
      breakpoint: dimensions,
      passed: issues.length === 0,
      issues,
      score: Math.max(0, 100 - (issues.length * 5))
    });
  }

  async testViewportMeta() {
    const issues = [];
    
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    
    if (!viewportMeta) {
      issues.push({
        issue: 'Meta tag viewport não encontrada',
        recommendation: 'Adicionar <meta name="viewport" content="width=device-width, initial-scale=1">'
      });
    } else {
      const content = viewportMeta.getAttribute('content');
      
      if (!content.includes('width=device-width')) {
        issues.push({
          issue: 'Viewport não configurado para largura do dispositivo',
          current: content,
          recommendation: 'Incluir width=device-width no viewport'
        });
      }
      
      if (!content.includes('initial-scale=1')) {
        issues.push({
          issue: 'Escala inicial não definida',
          current: content,
          recommendation: 'Incluir initial-scale=1 no viewport'
        });
      }
      
      if (content.includes('user-scalable=no')) {
        issues.push({
          issue: 'Zoom desabilitado (problema de acessibilidade)',
          current: content,
          recommendation: 'Remover user-scalable=no para permitir zoom'
        });
      }
    }

    this.results.push({
      test: 'Meta Viewport',
      passed: issues.length === 0,
      issues,
      score: issues.length === 0 ? 100 : 0
    });
  }

  async testScrollBehavior() {
    const issues = [];
    
    // Verificar scroll suave
    const htmlStyles = window.getComputedStyle(document.documentElement);
    if (htmlStyles.scrollBehavior !== 'smooth') {
      issues.push({
        issue: 'Scroll suave não implementado',
        recommendation: 'Adicionar scroll-behavior: smooth ao CSS'
      });
    }
    
    // Verificar áreas scrolláveis com indicadores
    const scrollableElements = document.querySelectorAll('*');
    scrollableElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      if (styles.overflowY === 'scroll' || styles.overflowY === 'auto') {
        if (element.scrollHeight > element.clientHeight) {
          // Verificar se tem indicador visual de scroll
          const hasScrollbar = element.scrollWidth > element.clientWidth;
          if (!hasScrollbar && styles.scrollbarWidth === 'none') {
            issues.push({
              issue: 'Área scrollável sem indicador visual',
              element: element.tagName.toLowerCase(),
              className: element.className
            });
          }
        }
      }
    });

    this.results.push({
      test: 'Comportamento de Scroll',
      passed: issues.length === 0,
      issues,
      score: Math.max(0, 100 - (issues.length * 20))
    });
  }

  async testTouchTargets() {
    const issues = [];
    
    const interactiveElements = document.querySelectorAll(
      'button, a, input, select, textarea, [onclick], [role="button"]'
    );
    
    interactiveElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const minSize = 44; // Recomendação WCAG
      
      if (rect.width < minSize || rect.height < minSize) {
        issues.push({
          element: element.tagName.toLowerCase(),
          className: element.className,
          issue: `Área de toque pequena: ${Math.round(rect.width)}x${Math.round(rect.height)}px`,
          recommendation: `Aumentar para pelo menos ${minSize}x${minSize}px`
        });
      }
      
      // Verificar espaçamento entre elementos interativos
      const siblings = Array.from(element.parentElement?.children || []);
      const elementIndex = siblings.indexOf(element);
      
      if (elementIndex > 0) {
        const prevElement = siblings[elementIndex - 1];
        if (this.isInteractive(prevElement)) {
          const prevRect = prevElement.getBoundingClientRect();
          const distance = Math.min(
            Math.abs(rect.left - prevRect.right),
            Math.abs(rect.top - prevRect.bottom)
          );
          
          if (distance < 8) {
            issues.push({
              element: element.tagName.toLowerCase(),
              className: element.className,
              issue: `Pouco espaçamento entre elementos interativos: ${Math.round(distance)}px`,
              recommendation: 'Aumentar espaçamento para pelo menos 8px'
            });
          }
        }
      }
    });

    this.results.push({
      test: 'Alvos de Toque',
      passed: issues.length === 0,
      issues,
      score: Math.max(0, 100 - (issues.length * 10))
    });
  }

  isInteractive(element) {
    const interactiveTags = ['button', 'a', 'input', 'select', 'textarea'];
    const hasClickHandler = element.hasAttribute('onclick') || element.getAttribute('role') === 'button';
    
    return interactiveTags.includes(element.tagName.toLowerCase()) || hasClickHandler;
  }

  setViewportSize(width, height) {
    // Simular mudança de viewport (limitado em browsers reais)
    // Em testes reais, usaríamos ferramentas como Puppeteer
    if (window.chrome && window.chrome.debugger) {
      // Chrome DevTools Protocol (se disponível)
      window.chrome.debugger.sendCommand('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: width < 768
      });
    } else {
      // Fallback: redimensionar janela (pode não funcionar em todos os browsers)
      try {
        window.resizeTo(width, height);
      } catch (error) {
        console.warn('Não foi possível redimensionar a janela:', error);
      }
    }
  }

  async waitForReflow() {
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });
  }

  generateReport() {
    const totalScore = this.results.reduce((sum, result) => sum + result.score, 0) / this.results.length;
    const totalIssues = this.results.reduce((sum, result) => sum + result.issues.length, 0);
    
    const deviceScores = {};
    this.results.forEach(result => {
      if (result.device) {
        deviceScores[result.device] = result.score;
      }
    });
    
    return {
      success: true,
      score: Math.round(totalScore),
      grade: this.getGrade(totalScore),
      totalIssues,
      deviceScores,
      results: this.results,
      recommendations: this.getRecommendations()
    };
  }

  getGrade(score) {
    if (score >= 90) return 'Excelente';
    if (score >= 80) return 'Bom';
    if (score >= 70) return 'Regular';
    if (score >= 60) return 'Precisa Melhorar';
    return 'Crítico';
  }

  getRecommendations() {
    const recommendations = [];
    const criticalIssues = this.results.filter(result => result.score < 70);
    
    if (criticalIssues.length > 0) {
      recommendations.push('Corrigir problemas críticos de responsividade encontrados');
    }
    
    if (this.results.some(result => result.test.includes('mobile') && !result.passed)) {
      recommendations.push('Otimizar experiência mobile com foco em touch targets e legibilidade');
    }
    
    if (this.results.some(result => result.test === 'Meta Viewport' && !result.passed)) {
      recommendations.push('Configurar corretamente a meta tag viewport');
    }
    
    if (this.results.some(result => result.test === 'Alvos de Toque' && !result.passed)) {
      recommendations.push('Aumentar tamanho e espaçamento de elementos interativos');
    }
    
    return recommendations;
  }
}

export default ResponsiveTester;
