// arquivo de configuração simples pros módulos
// meio que um lugar pra centralizar settings que uso nos componentes

export const CONFIG = {
  // firestore collections names
  collections: {
    tarefas: 'tarefas',
    eventos: 'eventos', 
    metas: 'metas',
    usuarios: 'alunos'
  },
  
  // timing configs
  debounceTime: 300, // ms para debounce em buscas
  autoSaveDelay: 2000, // ms para auto save
  notificationDuration: 3000, // ms para notificações
  
  // limites
  limits: {
    maxTarefas: 100,
    maxEventos: 50,
    maxMetas: 30,
    maxDescricaoLength: 500,
    minTituloLength: 3
  },
  
  // formatos de data
  dateFormats: {
    display: 'DD/MM/YYYY',
    api: 'YYYY-MM-DD',
    complete: 'DD/MM/YYYY HH:mm'
  },
  
  // cores por categoria/prioridade
  colors: {
    prioridades: {
      alta: '#e74c3c',
      media: '#f39c12', 
      baixa: '#27ae60'
    },
    status: {
      pendente: '#95a5a6',
      progresso: '#3498db',
      concluido: '#27ae60',
      atrasado: '#e74c3c'
    },
    categorias: {
      trabalho: '#3498db',
      pessoal: '#9b59b6',
      estudos: '#f39c12',
      saude: '#27ae60',
      financas: '#e67e22',
      outros: '#95a5a6'
    }
  },
  
  // textos padrão - assim não fica hardcoded
  defaultTexts: {
    // organização
    placeholderTarefa: 'Digite sua tarefa...',
    emptyTarefas: 'Nenhuma tarefa adicionada ainda',
    
    // agenda
    placeholderEvento: 'Descreva seu compromisso...',
    emptyEventos: 'Agenda vazia por enquanto',
    
    // planejamento 
    placeholderMeta: 'Defina sua meta...',
    emptyMetas: 'Sem metas definidas ainda',
    
    // geral
    carregando: 'Carregando...',
    erro: 'Ops! Algo deu errado',
    semInternet: 'Verifique sua conexão',
    salvando: 'Salvando...',
    salvo: 'Salvo!'
  },
  
  // keys para localStorage
  storageKeys: {
    theme: 'learnhub_theme',
    lastSync: 'learnhub_last_sync',
    userPrefs: 'learnhub_user_prefs',
    tempData: 'learnhub_temp_data'
  },
  
  // apis externas
  external: {
    googleCalendar: {
      enabled: false, // por enquanto false
      apiKey: process.env.REACT_APP_GOOGLE_CALENDAR_API_KEY
    }
  },
  
  // features flags - pra poder ligar/desligar coisas
  features: {
    autoSync: true,
    offlineMode: false,
    notifications: true,
    statistics: true,
    export: false, // ainda não implementado
    import: false  // ainda não implementado
  },
  
  // breakpoints pra responsividade
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200
  }
};

// helper functions
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const formatDate = (date, format = CONFIG.dateFormats.display) => {
  if (!date) return '';
  
  // implementação bem básica - normalmente usaria uma lib
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD/MM/YYYY HH:mm':
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    default:
      return d.toLocaleDateString('pt-BR');
  }
};

export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getColorByCategory = (category, type = 'categorias') => {
  return CONFIG.colors[type][category] || CONFIG.colors[type].outros;
};

export const isMobile = () => {
  return window.innerWidth <= CONFIG.breakpoints.mobile;
};

export const isTablet = () => {
  return window.innerWidth <= CONFIG.breakpoints.tablet && window.innerWidth > CONFIG.breakpoints.mobile;
};

export const isDesktop = () => {
  return window.innerWidth > CONFIG.breakpoints.tablet;
};
