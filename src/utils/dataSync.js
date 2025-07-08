// utilitário para sincronização entre módulos
// meio que um helper para quando precisar integrar dados entre agenda, organização e planejamento

import { db } from '../firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc,
  serverTimestamp 
} from 'firebase/firestore';

// função para buscar todas as tarefas/eventos de um usuário
export const getUserData = async (userId) => {
  try {
    const userData = {
      tarefas: [],
      eventos: [],
      metas: []
    };

    // pega tarefas da organização
    const tarefasQuery = query(
      collection(db, 'tarefas'), 
      where('userId', '==', userId)
    );
    const tarefasSnapshot = await getDocs(tarefasQuery);
    userData.tarefas = tarefasSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // pega eventos da agenda
    const eventosQuery = query(
      collection(db, 'eventos'), 
      where('userId', '==', userId)
    );
    const eventosSnapshot = await getDocs(eventosQuery);
    userData.eventos = eventosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // pega metas do planejamento
    const metasQuery = query(
      collection(db, 'metas'), 
      where('userId', '==', userId)
    );
    const metasSnapshot = await getDocs(metasQuery);
    userData.metas = metasSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return userData;
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    return null;
  }
};

// funcão para criar evento na agenda baseado em meta do planejamento
export const createEventFromMeta = async (meta, userId) => {
  try {
    // calcula data de vencimento baseada no prazo da meta
    const dataEvento = meta.prazo || new Date();
    
    const evento = {
      titulo: `Meta: ${meta.titulo}`,
      descricao: meta.descricao || 'Meta do planejamento',
      data: dataEvento,
      hora: '09:00', // horário padrão meio aleatório
      userId: userId,
      tipo: 'meta',
      metaId: meta.id,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'eventos'), evento);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Erro ao criar evento da meta:', error);
    return { success: false, error };
  }
};

// função para criar tarefa na organização baseada em meta
export const createTaskFromMeta = async (meta, userId) => {
  try {
    const tarefa = {
      texto: `${meta.titulo} - ${meta.descricao || 'Meta do planejamento'}`,
      concluida: false,
      userId: userId,
      categoria: 'meta',
      prioridade: meta.categoria === 'urgente' ? 'alta' : 'media',
      metaId: meta.id,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'tarefas'), tarefa);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Erro ao criar tarefa da meta:', error);
    return { success: false, error };
  }
};

// funcao para marcar meta como concluída quando todas as tarefas relacionadas estão prontas
export const checkMetaCompletion = async (metaId, userId) => {
  try {
    // busca todas as tarefas relacionadas à meta
    const tarefasQuery = query(
      collection(db, 'tarefas'),
      where('metaId', '==', metaId),
      where('userId', '==', userId)
    );
    
    const tarefasSnapshot = await getDocs(tarefasQuery);
    const tarefas = tarefasSnapshot.docs.map(doc => doc.data());
    
    // verifica se todas estão concluídas
    const todasConcluidas = tarefas.length > 0 && tarefas.every(t => t.concluida);
    
    if (todasConcluidas) {
      // atualiza a meta como concluída
      const metaRef = doc(db, 'metas', metaId);
      await updateDoc(metaRef, {
        concluida: true,
        dataConclussao: serverTimestamp()
      });
      
      return { success: true, completed: true };
    }
    
    return { success: true, completed: false };
  } catch (error) {
    console.error('Erro ao verificar conclusão da meta:', error);
    return { success: false, error };
  }
};

// função meio genérica para estatísticas
export const getUserStats = async (userId) => {
  try {
    const data = await getUserData(userId);
    
    if (!data) return null;
    
    const stats = {
      totalTarefas: data.tarefas.length,
      tarefasConcluidas: data.tarefas.filter(t => t.concluida).length,
      totalEventos: data.eventos.length,
      eventosHoje: data.eventos.filter(e => {
        const hoje = new Date().toDateString();
        const eventoData = new Date(e.data.seconds * 1000).toDateString();
        return hoje === eventoData;
      }).length,
      totalMetas: data.metas.length,
      metasConcluidas: data.metas.filter(m => m.concluida).length
    };
    
    // calculos de porcentagem meio básicos
    stats.progressoTarefas = stats.totalTarefas > 0 
      ? Math.round((stats.tarefasConcluidas / stats.totalTarefas) * 100) 
      : 0;
      
    stats.progressoMetas = stats.totalMetas > 0 
      ? Math.round((stats.metasConcluidas / stats.totalMetas) * 100) 
      : 0;
    
    return stats;
  } catch (error) {
    console.error('Erro ao calcular estatísticas:', error);
    return null;
  }
};
