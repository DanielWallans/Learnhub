// sistema simples de notificações
// nada muito elaborado, só para dar feedback pro usuário

import { useState } from 'react';

// tipos de notificação básicos - usando console como fallback
export const notify = {
  success: (message) => {
    // se tiver alguma lib de toast, usar ela aqui
    // por agora só console mesmo
    console.log('[SUCCESS]', message);
  },
  
  error: (message) => {
    console.error('[ERROR]', message);
  },
  
  info: (message) => {
    console.info('[INFO]', message);
  },
  
  warning: (message) => {
    console.warn('[WARNING]', message);
  }
};

// notificações específicas do sistema
export const notifyUser = {
  // organização
  tarefaAdicionada: () => notify.success('Tarefa adicionada com sucesso!'),
  tarefaConcluida: () => notify.success('Parabéns! Tarefa concluída!'),
  tarefaRemovida: () => notify.info('Tarefa removida'),
  tarefaEditada: () => notify.success('Tarefa atualizada!'),
  
  // agenda
  eventoAdicionado: () => notify.success('Evento adicionado à agenda!'),
  eventoRemovido: () => notify.info('Evento removido da agenda'),
  eventoEditado: () => notify.success('Evento atualizado!'),
  lembreteEvento: (titulo) => notify.info(`Lembrete: ${titulo}`),
  
  // planejamento
  metaAdicionada: () => notify.success('Meta adicionada ao planejamento!'),
  metaConcluida: () => notify.success('Meta concluída!'),
  metaRemovida: () => notify.info('Meta removida'),
  metaEditada: () => notify.success('Meta atualizada!'),
  
  // sincronização
  dadosSincronizados: () => notify.success('Dados sincronizados!'),
  erroSincronizacao: () => notify.error('Erro na sincronização'),
  
  // autenticação 
  loginSucesso: (nome) => notify.success(`Bem-vindo(a), ${nome}!`),
  logoutSucesso: () => notify.info('Até mais!'),
  erroAutenticacao: () => notify.error('Erro na autenticação'),
  
  // geral
  salvoComSucesso: () => notify.success('Salvo com sucesso!'),
  erroGenerico: () => notify.error('Ops! Algo deu errado'),
  carregando: () => notify.info('Carregando...'),
  operacaoCancelada: () => notify.info('Operação cancelada')
};

// função para mostrar feedbacks mais elaborados no próprio componente
export const createFeedback = (type, message, duration = 3000) => {
  return {
    type,
    message,
    id: Date.now() + Math.random(), // id meio tosco mas funciona
    duration,
    timestamp: new Date()
  };
};

// hook simples para gerenciar feedbacks locais (sem toast)
export const useFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  
  const addFeedback = (type, message, duration = 3000) => {
    const feedback = createFeedback(type, message, duration);
    setFeedbacks(prev => [...prev, feedback]);
    
    // remove automaticamente após o tempo
    if (duration > 0) {
      setTimeout(() => {
        removeFeedback(feedback.id);
      }, duration);
    }
    
    return feedback.id;
  };
  
  const removeFeedback = (id) => {
    setFeedbacks(prev => prev.filter(f => f.id !== id));
  };
  
  const clearAllFeedbacks = () => {
    setFeedbacks([]);
  };
  
  return {
    feedbacks,
    addFeedback,
    removeFeedback,
    clearAllFeedbacks,
    // shortcuts
    success: (msg, duration) => addFeedback('success', msg, duration),
    error: (msg, duration) => addFeedback('error', msg, duration),
    info: (msg, duration) => addFeedback('info', msg, duration),
    warning: (msg, duration) => addFeedback('warning', msg, duration)
  };
};
