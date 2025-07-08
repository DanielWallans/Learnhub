import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  doc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';
import './organizacao.css';

function Organizacao() {
  const [tarefas, setTarefas] = useState([]);
  const [novaTarefa, setNovaTarefa] = useState('');
  const [novaPrioridade, setNovaPrioridade] = useState('média');
  const [editando, setEditando] = useState(null);
  const [textoEditado, setTextoEditado] = useState('');
  const [prioridadeEditada, setPrioridadeEditada] = useState('média');
  const [filtro, setFiltro] = useState('todas');
  const [feedback, setFeedback] = useState('');
  const [user, setUser] = useState(undefined); // undefined para diferenciar "carregando" de "não logado"

  // Ouça autenticação
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  // Ouça tarefas do Firestore somente se user estiver pronto
  useEffect(() => {
    if (user === undefined) return; // ainda carregando
    if (!user) {
      setTarefas([]);
      return;
    }
    const q = query(
      collection(db, 'organizacao-tarefas'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const arr = [];
      snapshot.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
      setTarefas(arr);
    });
    return () => unsubscribe();
  }, [user]);

  // Feedback visual temporário
  const mostrarFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 1500);
  };

  const adicionarTarefa = async () => {
    if (novaTarefa.trim() && user) {
      await addDoc(collection(db, 'organizacao-tarefas'), {
        texto: novaTarefa,
        prioridade: novaPrioridade,
        concluida: false,
        uid: user.uid,
        createdAt: serverTimestamp()
      });
      setNovaTarefa('');
      setNovaPrioridade('média');
      mostrarFeedback('Tarefa adicionada!');
    }
  };

  const excluirTarefa = async (id) => {
    await deleteDoc(doc(db, 'organizacao-tarefas', id));
    mostrarFeedback('Tarefa excluída!');
  };

  const iniciarEdicao = (idx, tarefa) => {
    setEditando(tarefa.id);
    setTextoEditado(tarefa.texto);
    setPrioridadeEditada(tarefa.prioridade || 'média');
  };

  const salvarEdicao = async (id) => {
    await updateDoc(doc(db, 'organizacao-tarefas', id), {
      texto: textoEditado,
      prioridade: prioridadeEditada
    });
    setEditando(null);
    setTextoEditado('');
    mostrarFeedback('Tarefa editada!');
  };

  const cancelarEdicao = () => {
    setEditando(null);
    setTextoEditado('');
  };

  const alternarConcluida = async (id, concluida) => {
    await updateDoc(doc(db, 'organizacao-tarefas', id), {
      concluida: !concluida
    });
  };

  const limparTarefas = async () => {
    const promises = tarefas.map(tarefa =>
      deleteDoc(doc(db, 'organizacao-tarefas', tarefa.id))
    );
    await Promise.all(promises);
    mostrarFeedback('Todas as tarefas foram removidas!');
  };

  // Filtro de tarefas
  const tarefasFiltradas = tarefas.filter(tarefa => {
    if (filtro === 'todas') return true;
    if (filtro === 'pendentes') return !tarefa.concluida;
    if (filtro === 'concluidas') return tarefa.concluida;
    return true;
  });

  // Estatísticas das tarefas
  const stats = {
    total: tarefas.length,
    pendentes: tarefas.filter(t => !t.concluida).length,
    concluidas: tarefas.filter(t => t.concluida).length,
    alta: tarefas.filter(t => t.prioridade === 'alta' && !t.concluida).length
  };

  if (user === undefined) {
    return <div className="card-tarefas">Carregando...</div>;
  }

  if (!user) {
    return <div className="card-tarefas">Faça login para acessar suas tarefas.</div>;
  }

  return (
    <div className="card-tarefas">
      <div className="cabecalho-org">
        <h3 className="titulo-org">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M9 11H4a2 2 0 00-2 2v3a2 2 0 002 2h5m0-7v7m0-7h6a2 2 0 012 2v3a2 2 0 01-2 2h-6m0-7V4a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2 2z"/>
          </svg>
          Organização
        </h3>
        <span className="badge-pendentes">{stats.pendentes} pendentes</span>
      </div>

      {feedback && (
        <div className={`aviso-feedback ${feedback.includes('!') ? 'success' : 'error'}`}>
          {feedback}
        </div>
      )}

      <div className="estatisticas-org">
        <div className="stat-box">
          <div className="numero-stat">{stats.total}</div>
          <div className="label-stat">Total</div>
        </div>
        <div className="stat-box">
          <div className="numero-stat">{stats.pendentes}</div>
          <div className="label-stat">Pendentes</div>
        </div>
        <div className="stat-box">
          <div className="numero-stat">{stats.alta}</div>
          <div className="label-stat">Alta</div>
        </div>
      </div>

      <div className="conteudo-org">
        <div className="form-nova-tarefa">
          <input
            type="text"
            placeholder="Nova tarefa..."
            value={novaTarefa}
            onChange={(e) => setNovaTarefa(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && adicionarTarefa()}
            className="input-tarefa"
          />
          <select
            value={novaPrioridade}
            onChange={(e) => setNovaPrioridade(e.target.value)}
            className="select-prioridade"
          >
            <option value="baixa">Baixa</option>
            <option value="média">Média</option>
            <option value="alta">Alta</option>
          </select>
          <button
            onClick={adicionarTarefa}
            disabled={!novaTarefa.trim()}
            className="btn-nova"
          >
            +
          </button>
        </div>

        <div className="filtros-tarefa">
          <button
            onClick={() => setFiltro('todas')}
            className={`btn-filtro ${filtro === 'todas' ? 'active' : ''}`}
          >
            Todas
          </button>
          <button
            onClick={() => setFiltro('pendentes')}
            className={`btn-filtro ${filtro === 'pendentes' ? 'active' : ''}`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setFiltro('concluidas')}
            className={`btn-filtro ${filtro === 'concluidas' ? 'active' : ''}`}
          >
            Concluídas
          </button>
        </div>

        <div className="lista-tarefas">
          {tarefasFiltradas.length === 0 ? (
            <div className="lista-vazia">
              {filtro === 'todas' ? 'Nenhuma tarefa criada' : `Nenhuma tarefa ${filtro}`}
            </div>
          ) : (
            tarefasFiltradas.slice(0, 5).map((tarefa) => (
              <div
                key={tarefa.id}
                className={`item-tarefa ${tarefa.concluida ? 'completed' : ''} priority-${tarefa.prioridade}`}
              >
                {editando === tarefa.id ? (
                  <>
                    <div className="conteudo-editando">
                      <input
                        type="text"
                        value={textoEditado}
                        onChange={(e) => setTextoEditado(e.target.value)}
                        className="input-edicao"
                        style={{ marginBottom: '4px' }}
                        onKeyPress={(e) => e.key === 'Enter' && salvarEdicao(tarefa.id)}
                        autoFocus
                      />
                      <select
                        value={prioridadeEditada}
                        onChange={(e) => setPrioridadeEditada(e.target.value)}
                        className="select-edicao"
                      >
                        <option value="baixa">Baixa</option>
                        <option value="média">Média</option>
                        <option value="alta">Alta</option>
                      </select>
                    </div>
                    <div className="acoes-item">
                      <button
                        onClick={() => salvarEdicao(tarefa.id)}
                        className="btn-acao"
                        title="Salvar"
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <polyline points="20,6 9,17 4,12"/>
                        </svg>
                      </button>
                      <button
                        onClick={cancelarEdicao}
                        className="btn-acao"
                        title="Cancelar"
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="conteudo-item">
                      <div className="texto-tarefa">{tarefa.texto}</div>
                      <div className="meta-info">
                        Prioridade: {tarefa.prioridade} • {tarefa.concluida ? 'Concluída' : 'Pendente'}
                      </div>
                    </div>
                    <div className="acoes-item">
                      <button
                        onClick={() => alternarConcluida(tarefa.id, tarefa.concluida)}
                        className="btn-acao"
                        title={tarefa.concluida ? 'Marcar como pendente' : 'Marcar como concluída'}
                      >
                        {tarefa.concluida ? (
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M1 4v6h6"/>
                            <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
                          </svg>
                        ) : (
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <polyline points="20,6 9,17 4,12"/>
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => iniciarEdicao(null, tarefa)}
                        className="btn-acao"
                        title="Editar"
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => excluirTarefa(tarefa.id)}
                        className="btn-acao"
                        title="Excluir"
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <polyline points="3,6 5,6 21,6"/>
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {tarefasFiltradas.length > 5 && (
          <div className="meta-info" style={{ textAlign: 'center', marginTop: '8px' }}>
            +{tarefasFiltradas.length - 5} mais tarefas...
          </div>
        )}
      </div>
    </div>
  );
}

export default Organizacao;