class AnalyticsService {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.events = [];
    this.performance = {};
    this.userPreferences = this.loadUserPreferences();
    this.isEnabled = this.userPreferences.analyticsEnabled !== false;
    
    if (this.isEnabled) {
      this.initializeTracking();
    }
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  loadUserPreferences() {
    try {
      return JSON.parse(localStorage.getItem('learnhub-preferences') || '{}');
    } catch {
      return {};
    }
  }

  saveUserPreferences() {
    localStorage.setItem('learnhub-preferences', JSON.stringify(this.userPreferences));
  }

  initializeTracking() {
    // Configuração inicial do tracking
    this.trackPerformanceMetrics();
    this.setupEventListeners();
    this.trackEngagementMetrics();
    this.trackThemeUsage();
    this.startHeartbeat();
  }

  // Métricas básicas de performance
  trackPerformanceMetrics() {
    this.measureLCP(); // Largest Contentful Paint
    this.measureFID(); // First Input Delay
    this.measureCLS(); // Cumulative Layout Shift
    
    // Outras métricas
    this.measurePageLoadTime();
    this.measureMemoryUsage();
    this.measureNetworkSpeed();
  }

  measureLCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        this.performance.lcp = {
          value: lastEntry.startTime,
          timestamp: Date.now(),
          grade: this.gradeLCP(lastEntry.startTime)
        };
        
        this.trackEvent('performance_metric', {
          metric: 'lcp',
          value: lastEntry.startTime,
          grade: this.performance.lcp.grade
        });
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }

  measureFID() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.performance.fid = {
            value: entry.processingStart - entry.startTime,
            timestamp: Date.now(),
            grade: this.gradeFID(entry.processingStart - entry.startTime)
          };
          
          this.trackEvent('performance_metric', {
            metric: 'fid',
            value: this.performance.fid.value,
            grade: this.performance.fid.grade
          });
        }
      });
      
      observer.observe({ entryTypes: ['first-input'] });
    }
  }

  measureCLS() {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        
        this.performance.cls = {
          value: clsValue,
          timestamp: Date.now(),
          grade: this.gradeCLS(clsValue)
        };
        
        this.trackEvent('performance_metric', {
          metric: 'cls',
          value: clsValue,
          grade: this.performance.cls.grade
        });
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }

  measurePageLoadTime() {
    window.addEventListener('load', () => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      
      this.performance.pageLoad = {
        value: loadTime,
        timestamp: Date.now(),
        grade: this.gradePageLoad(loadTime)
      };
      
      this.trackEvent('performance_metric', {
        metric: 'page_load',
        value: loadTime,
        grade: this.performance.pageLoad.grade
      });
    });
  }

  measureMemoryUsage() {
    if ('memory' in performance) {
      const memory = performance.memory;
      
      this.performance.memory = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        timestamp: Date.now()
      };
      
      this.trackEvent('performance_metric', {
        metric: 'memory_usage',
        value: memory.usedJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      });
    }
  }

  measureNetworkSpeed() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      this.performance.network = {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        timestamp: Date.now()
      };
      
      this.trackEvent('performance_metric', {
        metric: 'network_speed',
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      });
    }
  }

  // EVENTOS DO USUÁRIO
  setupEventListeners() {
    // Cliques
    document.addEventListener('click', (event) => {
      this.trackEvent('click', {
        element: event.target.tagName,
        className: event.target.className,
        text: event.target.textContent?.slice(0, 50),
        x: event.clientX,
        y: event.clientY
      });
    });
    
    // Navegação entre módulos
    window.addEventListener('hashchange', () => {
      this.trackEvent('navigation', {
        from: this.currentModule,
        to: window.location.hash,
        timestamp: Date.now()
      });
      this.currentModule = window.location.hash;
    });
    
    // Scroll
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.trackEvent('scroll', {
          scrollY: window.scrollY,
          scrollPercentage: (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        });
      }, 100);
    });
    
    // Tempo de permanência em campos de input
    document.addEventListener('focusin', (event) => {
      if (event.target.matches('input, textarea, select')) {
        event.target._focusTime = Date.now();
      }
    });
    
    document.addEventListener('focusout', (event) => {
      if (event.target.matches('input, textarea, select') && event.target._focusTime) {
        const focusDuration = Date.now() - event.target._focusTime;
        this.trackEvent('input_focus', {
          element: event.target.tagName,
          type: event.target.type,
          duration: focusDuration,
          value_length: event.target.value?.length || 0
        });
      }
    });
  }

  // MÉTRICAS DE ENGAJAMENTO
  trackEngagementMetrics() {
    // Tempo na página
    setInterval(() => {
      this.trackEvent('time_on_page', {
        duration: Date.now() - this.startTime,
        activeModule: this.currentModule
      });
    }, 30000); // A cada 30 segundos
    
    // Interações por módulo
    this.moduleInteractions = {};
    
    // Frequência de uso de funcionalidades
    this.featureUsage = {};
  }

  // MÉTRICAS DE TEMA
  trackThemeUsage() {
    // Detectar mudanças de tema
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          this.trackEvent('theme_change', {
            from: mutation.oldValue,
            to: mutation.target.getAttribute('data-theme'),
            timestamp: Date.now()
          });
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ['data-theme']
    });
    
    // Rastrear horário de uso do modo escuro
    const hour = new Date().getHours();
    this.trackEvent('theme_usage', {
      theme: document.documentElement.getAttribute('data-theme'),
      hour,
      isNight: hour < 6 || hour > 18
    });
  }

  // FUNÇÕES DE CLASSIFICAÇÃO
  gradeLCP(value) {
    if (value <= 2500) return 'good';
    if (value <= 4000) return 'needs_improvement';
    return 'poor';
  }

  gradeFID(value) {
    if (value <= 100) return 'good';
    if (value <= 300) return 'needs_improvement';
    return 'poor';
  }

  gradeCLS(value) {
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs_improvement';
    return 'poor';
  }

  gradePageLoad(value) {
    if (value <= 3000) return 'good';
    if (value <= 5000) return 'needs_improvement';
    return 'poor';
  }

  // TRACKING PRINCIPAL
  trackEvent(eventType, data = {}) {
    if (!this.isEnabled) return;
    
    const event = {
      id: this.generateEventId(),
      sessionId: this.sessionId,
      type: eventType,
      data,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
    
    this.events.push(event);
    
    // Manter apenas os últimos 1000 eventos
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
    
    // Salvar periodicamente
    if (this.events.length % 10 === 0) {
      this.saveToLocalStorage();
    }
  }

  generateEventId() {
    return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // FUNCIONALIDADES ESPECÍFICAS DO LEARNHUB
  trackModuleUsage(moduleName, action, data = {}) {
    this.trackEvent('module_usage', {
      module: moduleName,
      action,
      ...data
    });
    
    // Atualizar contador de interações do módulo
    if (!this.moduleInteractions[moduleName]) {
      this.moduleInteractions[moduleName] = 0;
    }
    this.moduleInteractions[moduleName]++;
  }

  trackFeatureUsage(featureName, data = {}) {
    this.trackEvent('feature_usage', {
      feature: featureName,
      ...data
    });
    
    // Atualizar contador de uso da funcionalidade
    if (!this.featureUsage[featureName]) {
      this.featureUsage[featureName] = 0;
    }
    this.featureUsage[featureName]++;
  }

  trackError(error, context = {}) {
    this.trackEvent('error', {
      message: error.message,
      stack: error.stack,
      context
    });
  }

  // HEARTBEAT E SESSÃO
  startHeartbeat() {
    setInterval(() => {
      this.trackEvent('heartbeat', {
        sessionDuration: Date.now() - this.startTime,
        eventsCount: this.events.length
      });
    }, 60000); // A cada minuto
  }

  // ARMAZENAMENTO E EXPORTAÇÃO
  saveToLocalStorage() {
    try {
      const data = {
        sessionId: this.sessionId,
        events: this.events.slice(-100), // Salvar apenas os últimos 100 eventos
        performance: this.performance,
        moduleInteractions: this.moduleInteractions,
        featureUsage: this.featureUsage,
        lastSaved: Date.now()
      };
      
      localStorage.setItem('learnhub-analytics', JSON.stringify(data));
    } catch (error) {
      console.warn('Erro ao salvar analytics:', error);
    }
  }

  loadFromLocalStorage() {
    try {
      const data = JSON.parse(localStorage.getItem('learnhub-analytics') || '{}');
      return data;
    } catch {
      return {};
    }
  }

  exportData() {
    return {
      sessionId: this.sessionId,
      sessionDuration: Date.now() - this.startTime,
      events: this.events,
      performance: this.performance,
      moduleInteractions: this.moduleInteractions,
      featureUsage: this.featureUsage,
      exportedAt: new Date().toISOString()
    };
  }

  generateReport() {
    const data = this.exportData();
    
    return {
      summary: {
        sessionDuration: data.sessionDuration,
        totalEvents: data.events.length,
        averageEventsPerMinute: (data.events.length / (data.sessionDuration / 60000)).toFixed(2),
        mostUsedModule: this.getMostUsedModule(),
        mostUsedFeature: this.getMostUsedFeature()
      },
      performance: {
        lcp: this.performance.lcp,
        fid: this.performance.fid,
        cls: this.performance.cls,
        pageLoad: this.performance.pageLoad,
        overall: this.getOverallPerformanceGrade()
      },
      engagement: {
        moduleInteractions: this.moduleInteractions,
        featureUsage: this.featureUsage,
        timeDistribution: this.getTimeDistribution()
      },
      recommendations: this.getRecommendations()
    };
  }

  getMostUsedModule() {
    return Object.entries(this.moduleInteractions)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
  }

  getMostUsedFeature() {
    return Object.entries(this.featureUsage)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
  }

  getOverallPerformanceGrade() {
    const grades = [
      this.performance.lcp?.grade,
      this.performance.fid?.grade,
      this.performance.cls?.grade
    ].filter(Boolean);
    
    const goodCount = grades.filter(g => g === 'good').length;
    const totalCount = grades.length;
    
    if (goodCount === totalCount) return 'good';
    if (goodCount >= totalCount / 2) return 'needs_improvement';
    return 'poor';
  }

  getTimeDistribution() {
    const hourly = {};
    
    this.events.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hourly[hour] = (hourly[hour] || 0) + 1;
    });
    
    return hourly;
  }

  getRecommendations() {
    const recommendations = [];
    
    if (this.performance.lcp?.grade === 'poor') {
      recommendations.push('Otimizar carregamento de imagens e conteúdo principal');
    }
    
    if (this.performance.fid?.grade === 'poor') {
      recommendations.push('Reduzir JavaScript bloqueante e melhorar responsividade');
    }
    
    if (this.performance.cls?.grade === 'poor') {
      recommendations.push('Estabilizar layout e reduzir mudanças inesperadas');
    }
    
    const lowUsageModules = Object.entries(this.moduleInteractions)
      .filter(([,count]) => count < 5)
      .map(([module]) => module);
    
    if (lowUsageModules.length > 0) {
      recommendations.push(`Melhorar visibilidade dos módulos: ${lowUsageModules.join(', ')}`);
    }
    
    return recommendations;
  }

  // CONFIGURAÇÕES DE PRIVACIDADE
  enableAnalytics() {
    this.isEnabled = true;
    this.userPreferences.analyticsEnabled = true;
    this.saveUserPreferences();
    this.initializeTracking();
  }

  disableAnalytics() {
    this.isEnabled = false;
    this.userPreferences.analyticsEnabled = false;
    this.saveUserPreferences();
    this.clearData();
  }

  clearData() {
    this.events = [];
    this.performance = {};
    this.moduleInteractions = {};
    this.featureUsage = {};
    localStorage.removeItem('learnhub-analytics');
  }
}

export default new AnalyticsService();
