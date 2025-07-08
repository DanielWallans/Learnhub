import React, { useState, useRef, useEffect } from 'react';
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
import './Planejamento.css';

const periodos = [
  { label: 'Hoje', value: 'hoje' },
  { label: 'Semana', value: 'semana' },
  { label: 'Mês', value: 'mes' }
];

function Planejamento() {
  const [metas, setMetas] = useState([]);
  const [novaMeta, setNovaMeta] = useState('');
  const [periodo, setPeriodo] = useState('hoje');
  const [editandoId, setEditandoId] = useState(null);
  const [editandoTexto, setEditandoTexto] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(undefined);
  const [mostrarConcluidas, setMostrarConcluidas] = useState(false);
  const [feedback, setFeedback] = useState('');
  const inputEditRef = useRef(null);

  // Ouça autenticação
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  // Ouça metas do Firestore
  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      setMetas([]);
      return;
    }
    const q = query(
      collection(db, 'planejamento-metas'),
      where('uid', '==', user.uid),
      where('periodo', '==', periodo),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const arr = [];
      snapshot.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
      setMetas(arr);
    });
    return () => unsubscribe();
  }, [user, periodo]);

  useEffect(() => {
    if (editandoId && inputEditRef.current) {
      inputEditRef.current.focus();
    }
  }, [editandoId]);

  const mostrarFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 1500);
  };

  const adicionarMeta = async () => {
    if (novaMeta.trim() && user && !loading) {
      setLoading(true);
      await addDoc(collection(db, 'planejamento-metas'), {
        texto: novaMeta,
        periodo,
        concluida: false,
        uid: user.uid,
        createdAt: serverTimestamp()
      });
      setNovaMeta('');
      setLoading(false);
      mostrarFeedback('Meta adicionada!');
    }
  };

  const concluirMeta = async (meta) => {
    await updateDoc(doc(db, 'planejamento-metas', meta.id), {
      concluida: !meta.concluida
    });
    mostrarFeedback(meta.concluida ? 'Meta marcada como pendente!' : 'Meta concluída!');
  };

  const removerMeta = async (meta) => {
    await deleteDoc(doc(db, 'planejamento-metas', meta.id));
    mostrarFeedback('Meta removida!');
  };

  const iniciarEdicao = (meta) => {
    setEditandoId(meta.id);
    setEditandoTexto(meta.texto);
  };

  const salvarEdicao = async (meta) => {
    if (editandoTexto.trim() && !loading) {
      await updateDoc(doc(db, 'planejamento-metas', meta.id), {
        texto: editandoTexto
      });
      setEditandoId(null);
      setEditandoTexto('');
      mostrarFeedback('Meta editada!');
    }
  };

  const limparMetas = async () => {
    const promises = metas
      .filter(meta => mostrarConcluidas ? meta.concluida : !meta.concluida)
      .map(meta => deleteDoc(doc(db, 'planejamento-metas', meta.id)));
    await Promise.all(promises);
    mostrarFeedback('Metas removidas!');
  };

  // Filtro de metas
  const metasFiltradas = metas.filter(meta => mostrarConcluidas ? meta.concluida : !meta.concluida);

  // Estatísticas das metas
  const stats = {
    total: metas.length,
    pendentes: metas.filter(m => !m.concluida).length,
    concluidas: metas.filter(m => m.concluida).length,
    hoje: metas.filter(m => m.periodo === 'hoje' && !m.concluida).length
  };

  if (user === undefined) {
    return <div className="card-metas">Carregando...</div>;
  }
  if (!user) {
    return <div className="card-metas">Faça login para acessar suas metas.</div>;
  }

  return (
    <div className="planejamento-card">
      <div className="planejamento-header">
        <div className="header-info">
          <div className="icon-container">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4"/>
              <path d="M9 7V3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/>
              <path d="M13 3h2a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2"/>
            </svg>
          </div>
          <div className="header-text">
            <h3>Planejamento</h3>
            <p>Organize suas metas e objetivos</p>
          </div>
        </div>
        <div className="status-badges">
          <span className="badge pending">{stats.pendentes}</span>
          <span className="badge-label">Pendentes</span>
        </div>
      </div>

      {feedback && (
        <div className={`feedback-alert ${feedback.includes('!') ? 'success' : 'error'}`}>
          <div className="feedback-icon">
            {feedback.includes('!') ? (
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            ) : (
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            )}
          </div>
          <span>{feedback}</span>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.pendentes}</div>
          <div className="stat-label">Pendentes</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.concluidas}</div>
          <div className="stat-label">Concluídas</div>
        </div>
      </div>

      <div className="planejamento-content">
        <div className="period-filters">
          {periodos.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriodo(p.value)}
              className={`filter-btn ${periodo === p.value ? 'active' : ''}`}
              disabled={loading}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="add-meta-form">
          <div className="input-group">
            <input
              type="text"
              placeholder={`Nova meta para ${periodos.find(p => p.value === periodo)?.label.toLowerCase()}...`}
              value={novaMeta}
              onChange={(e) => setNovaMeta(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && adicionarMeta()}
              className="meta-input"
              disabled={loading}
            />
            <button
              onClick={adicionarMeta}
              disabled={loading || !novaMeta.trim()}
              className="add-btn"
              title="Adicionar meta"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="status-filters">
          <button
            onClick={() => setMostrarConcluidas(false)}
            className={`status-btn ${!mostrarConcluidas ? 'active' : ''}`}
          >
            <div className="status-indicator pending"></div>
            Pendentes
          </button>
          <button
            onClick={() => setMostrarConcluidas(true)}
            className={`status-btn ${mostrarConcluidas ? 'active' : ''}`}
          >
            <div className="status-indicator completed"></div>
            Concluídas
          </button>
        </div>

        <div className="metas-list">
          {metasFiltradas.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4"/>
                  <path d="M9 7V3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/>
                  <path d="M13 3h2a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2"/>
                </svg>
              </div>
              <p>{mostrarConcluidas ? 'Nenhuma meta concluída ainda' : 'Nenhuma meta pendente'}</p>
              {!mostrarConcluidas && <span>Comece adicionando uma nova meta acima!</span>}
            </div>
          ) : (
            metasFiltradas.slice(0, 6).map((meta) => (
              <div
                key={meta.id}
                className={`meta-item ${meta.concluida ? 'completed' : 'pending'}`}
              >
                {editandoId === meta.id ? (
                  <div className="edit-mode">
                    <div className="edit-input-group">
                      <input
                        ref={inputEditRef}
                        type="text"
                        value={editandoTexto}
                        onChange={(e) => setEditandoTexto(e.target.value)}
                        className="edit-input"
                        onKeyPress={(e) => e.key === 'Enter' && salvarEdicao(meta)}
                        disabled={loading}
                        autoFocus
                      />
                    </div>
                    <div className="edit-actions">
                      <button
                        onClick={() => salvarEdicao(meta)}
                        className="action-btn save"
                        title="Salvar alterações"
                        disabled={loading}
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <polyline points="20,6 9,17 4,12"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => setEditandoId(null)}
                        className="action-btn cancel"
                        title="Cancelar edição"
                        disabled={loading}
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="meta-content">
                      <div className="meta-text">{meta.texto}</div>
                      <div className="meta-info">
                        <span className="period-tag">{periodos.find(p => p.value === meta.periodo)?.label}</span>
                        <span className="status-tag">{meta.concluida ? 'Concluída' : 'Pendente'}</span>
                      </div>
                    </div>
                    <div className="meta-actions">
                      <button
                        onClick={() => concluirMeta(meta)}
                        className={`action-btn ${meta.concluida ? 'undo' : 'complete'}`}
                        title={meta.concluida ? 'Marcar como pendente' : 'Marcar como concluída'}
                        disabled={loading}
                      >
                        {meta.concluida ? (
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
                        onClick={() => iniciarEdicao(meta)}
                        className="action-btn edit"
                        title="Editar meta"
                        disabled={loading}
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => removerMeta(meta)}
                        className="action-btn delete"
                        title="Excluir meta"
                        disabled={loading}
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

        {metasFiltradas.length > 6 && (
          <div className="more-items">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="1"/>
              <circle cx="19" cy="12" r="1"/>
              <circle cx="5" cy="12" r="1"/>
            </svg>
            <span>+{metasFiltradas.length - 6} metas adicionais</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Planejamento;