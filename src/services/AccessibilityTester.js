class AccessibilityTester {
  constructor() {
    this.results = [];
    this.rules = {
      colorContrast: true,
      keyboardNavigation: true,
      ariaLabels: true,
      semanticHTML: true,
      focusManagement: true,
      altText: true
    };
  }

  async runAllTests() {
    this.results = [];
    
    try {
      await this.testColorContrast();
      await this.testKeyboardNavigation();
      await this.testAriaLabels();
      await this.testSemanticHTML();
      await this.testFocusManagement();
      await this.testAltText();
      
      return this.generateReport();
    } catch (error) {
      console.error('Erro ao executar testes de acessibilidade:', error);
      return { success: false, error: error.message };
    }
  }

  async testColorContrast() {
    const elements = document.querySelectorAll('*');
    const issues = [];

    elements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const contrast = this.calculateContrast(color, backgroundColor);
        const fontSize = parseInt(styles.fontSize);
        const fontWeight = styles.fontWeight;
        
        const requiredRatio = (fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700))) ? 3 : 4.5;
        
        if (contrast < requiredRatio) {
          issues.push({
            element: element.tagName.toLowerCase(),
            className: element.className,
            contrast: contrast.toFixed(2),
            required: requiredRatio,
            color,
            backgroundColor
          });
        }
      }
    });

    this.results.push({
      test: 'Contraste de Cores',
      passed: issues.length === 0,
      issues,
      score: Math.max(0, 100 - (issues.length * 10))
    });
  }

  async testKeyboardNavigation() {
    const focusableElements = document.querySelectorAll(
      'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
    );
    
    const issues = [];
    
    focusableElements.forEach((element, index) => {
      // Verificar se o elemento é visível
      const styles = window.getComputedStyle(element);
      if (styles.display === 'none' || styles.visibility === 'hidden') {
        return;
      }
      
      // Verificar se tem foco visível
      element.focus();
      const focusedStyles = window.getComputedStyle(element);
      if (!focusedStyles.outline && !focusedStyles.boxShadow) {
        issues.push({
          element: element.tagName.toLowerCase(),
          className: element.className,
          issue: 'Sem indicador visual de foco'
        });
      }
      
      // Verificar ordem do tabindex
      if (element.tabIndex > 0 && element.tabIndex !== index + 1) {
        issues.push({
          element: element.tagName.toLowerCase(),
          className: element.className,
          issue: 'Ordem de tabindex inconsistente'
        });
      }
    });

    this.results.push({
      test: 'Navegação por Teclado',
      passed: issues.length === 0,
      issues,
      score: Math.max(0, 100 - (issues.length * 15))
    });
  }

  async testAriaLabels() {
    const issues = [];
    
    // Verificar elementos interativos sem labels
    const interactiveElements = document.querySelectorAll('button, input, select, textarea, a');
    
    interactiveElements.forEach(element => {
      const hasAriaLabel = element.hasAttribute('aria-label');
      const hasAriaLabelledBy = element.hasAttribute('aria-labelledby');
      const hasTitle = element.hasAttribute('title');
      const hasTextContent = element.textContent.trim().length > 0;
      const hasPlaceholder = element.hasAttribute('placeholder');
      
      if (!hasAriaLabel && !hasAriaLabelledBy && !hasTitle && !hasTextContent && !hasPlaceholder) {
        issues.push({
          element: element.tagName.toLowerCase(),
          className: element.className,
          issue: 'Elemento interativo sem label acessível'
        });
      }
    });

    // Verificar roles ARIA
    const elementsWithRoles = document.querySelectorAll('[role]');
    elementsWithRoles.forEach(element => {
      const role = element.getAttribute('role');
      const validRoles = ['button', 'link', 'navigation', 'main', 'banner', 'contentinfo', 'complementary'];
      
      if (!validRoles.includes(role)) {
        issues.push({
          element: element.tagName.toLowerCase(),
          className: element.className,
          issue: `Role ARIA inválido: ${role}`
        });
      }
    });

    this.results.push({
      test: 'Labels ARIA',
      passed: issues.length === 0,
      issues,
      score: Math.max(0, 100 - (issues.length * 12))
    });
  }

  async testSemanticHTML() {
    const issues = [];
    
    // Verificar se existe apenas um h1
    const h1Elements = document.querySelectorAll('h1');
    if (h1Elements.length !== 1) {
      issues.push({
        element: 'h1',
        issue: `Deveria haver exatamente um h1, encontrados: ${h1Elements.length}`
      });
    }

    // Verificar hierarquia de headings
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    
    headings.forEach(heading => {
      const currentLevel = parseInt(heading.tagName.charAt(1));
      
      if (currentLevel > previousLevel + 1) {
        issues.push({
          element: heading.tagName.toLowerCase(),
          className: heading.className,
          issue: `Pulo na hierarquia de heading (${previousLevel} para ${currentLevel})`
        });
      }
      
      previousLevel = currentLevel;
    });

    // Verificar elementos landmark
    const landmarks = document.querySelectorAll('main, nav, header, footer, aside');
    if (landmarks.length === 0) {
      issues.push({
        element: 'landmark',
        issue: 'Nenhum elemento landmark encontrado'
      });
    }

    this.results.push({
      test: 'HTML Semântico',
      passed: issues.length === 0,
      issues,
      score: Math.max(0, 100 - (issues.length * 20))
    });
  }

  async testFocusManagement() {
    const issues = [];
    
    // Verificar se elementos hidden têm tabindex="-1"
    const hiddenElements = document.querySelectorAll('[hidden], .hidden, [style*="display: none"]');
    
    hiddenElements.forEach(element => {
      if (element.tabIndex !== -1 && element.hasAttribute('tabindex')) {
        issues.push({
          element: element.tagName.toLowerCase(),
          className: element.className,
          issue: 'Elemento oculto deve ter tabindex="-1"'
        });
      }
    });

    // Verificar skip links
    const skipLinks = document.querySelectorAll('a[href^="#"]');
    if (skipLinks.length === 0) {
      issues.push({
        element: 'skip-link',
        issue: 'Nenhum skip link encontrado'
      });
    }

    this.results.push({
      test: 'Gerenciamento de Foco',
      passed: issues.length === 0,
      issues,
      score: Math.max(0, 100 - (issues.length * 25))
    });
  }

  async testAltText() {
    const issues = [];
    
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      if (!img.hasAttribute('alt')) {
        issues.push({
          element: 'img',
          src: img.src,
          issue: 'Imagem sem atributo alt'
        });
      } else if (img.alt === '' && !img.hasAttribute('role')) {
        // Alt vazio é válido para imagens decorativas
        if (!img.closest('[role="presentation"]')) {
          issues.push({
            element: 'img',
            src: img.src,
            issue: 'Alt vazio em imagem que pode não ser decorativa'
          });
        }
      }
    });

    this.results.push({
      test: 'Texto Alternativo',
      passed: issues.length === 0,
      issues,
      score: Math.max(0, 100 - (issues.length * 30))
    });
  }

  calculateContrast(color1, color2) {
    // Converter cores para RGB
    const rgb1 = this.parseColor(color1);
    const rgb2 = this.parseColor(color2);
    
    // Calcular luminância relativa
    const lum1 = this.relativeLuminance(rgb1);
    const lum2 = this.relativeLuminance(rgb2);
    
    // Calcular contraste
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  parseColor(color) {
    // Criar elemento temporário para obter RGB
    const div = document.createElement('div');
    div.style.color = color;
    document.body.appendChild(div);
    
    const computedColor = window.getComputedStyle(div).color;
    document.body.removeChild(div);
    
    const match = computedColor.match(/\d+/g);
    return match ? [parseInt(match[0]), parseInt(match[1]), parseInt(match[2])] : [0, 0, 0];
  }

  relativeLuminance([r, g, b]) {
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;

    const rLin = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLin = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLin = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
  }

  generateReport() {
    const totalScore = this.results.reduce((sum, result) => sum + result.score, 0) / this.results.length;
    const totalIssues = this.results.reduce((sum, result) => sum + result.issues.length, 0);
    
    return {
      success: true,
      score: Math.round(totalScore),
      grade: this.getGrade(totalScore),
      totalIssues,
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
    
    this.results.forEach(result => {
      if (!result.passed) {
        switch (result.test) {
          case 'Contraste de Cores':
            recommendations.push('Ajustar cores para melhorar o contraste e legibilidade');
            break;
          case 'Navegação por Teclado':
            recommendations.push('Implementar indicadores visuais de foco e corrigir ordem de tab');
            break;
          case 'Labels ARIA':
            recommendations.push('Adicionar labels acessíveis aos elementos interativos');
            break;
          case 'HTML Semântico':
            recommendations.push('Usar elementos HTML semânticos e corrigir hierarquia de headings');
            break;
          case 'Gerenciamento de Foco':
            recommendations.push('Implementar skip links e gerenciar foco adequadamente');
            break;
          case 'Texto Alternativo':
            recommendations.push('Adicionar texto alternativo descritivo às imagens');
            break;
        }
      }
    });
    
    return recommendations;
  }
}

export default AccessibilityTester;
