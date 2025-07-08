import React, { useState, useEffect, useRef } from 'react';
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
import './Agenda.css';

function Agenda() {
  const [compromissos, setCompromissos] = useState([]);
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [editando, setEditando] = useState(null);
  const [editandoDescricao, setEditandoDescricao] = useState('');
  const [editandoData, setEditandoData] = useState('');
  const [editandoHora, setEditandoHora] = useState('');
  const [feedback, setFeedback] = useState('');
  const [user, setUser] = useState(undefined);
  const inputEditRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      setCompromissos([]);
      return;
    }
    const q = query(
      collection(db, 'agenda-compromissos'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const arr = [];
      snapshot.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
      setCompromissos(arr);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (editando !== null && inputEditRef.current) {
      inputEditRef.current.focus();
    }
  }, [editando]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const agora = new Date();
    compromissos.forEach((c) => {
      const dataHora = new Date(`${c.data}T${c.hora}`);
      if (
        dataHora.getFullYear() === agora.getFullYear() &&
        dataHora.getMonth() === agora.getMonth() &&
        dataHora.getDate() === agora.getDate() &&
        dataHora.getHours() === agora.getHours() &&
        dataHora.getMinutes() === agora.getMinutes() &&
        !c.notificado
      ) {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Lembrete de compromisso", {
            body: `${c.descricao} às ${c.hora}`,
          });
        }
        if (c.id) {
          updateDoc(doc(db, 'agenda-compromissos', c.id), { notificado: true });
        }
      }
    });
  }, [compromissos]);

  const mostrarFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 1500);
  };

  const adicionarCompromisso = async () => {
    if (descricao.trim() && data && hora && user) {
      await addDoc(collection(db, 'agenda-compromissos'), {
        descricao,
        data,
        hora,
        notificado: false,
        concluido: false,
        uid: user.uid,
        createdAt: serverTimestamp()
      });
      setDescricao('');
      setData('');
      setHora('');
      mostrarFeedback('Compromisso adicionado!');
    }
  };

  const removerCompromisso = async (id) => {
    await deleteDoc(doc(db, 'agenda-compromissos', id));
    mostrarFeedback('Compromisso removido!');
  };

  const concluirCompromisso = async (id, concluido) => {
    await updateDoc(doc(db, 'agenda-compromissos', id), {
      concluido: !concluido
    });
  };

  const iniciarEdicao = (c) => {
    setEditando(c.id);
    setEditandoDescricao(c.descricao);
    setEditandoData(c.data);
    setEditandoHora(c.hora);
  };

  const salvarEdicao = async (id) => {
    if (editandoDescricao.trim() && editandoData && editandoHora) {
      await updateDoc(doc(db, 'agenda-compromissos', id), {
        descricao: editandoDescricao,
        data: editandoData,
        hora: editandoHora
      });
      setEditando(null);
      setEditandoDescricao('');
      setEditandoData('');
      setEditandoHora('');
      mostrarFeedback('Compromisso editado!');
    }
  };

  const cancelarEdicao = () => {
    setEditando(null);
    setEditandoDescricao('');
    setEditandoData('');
    setEditandoHora('');
  };

  const criarLinkGoogleCalendar = (c) => {
    const dataInicio = `${c.data.replace(/-/g, '')}T${c.hora.replace(':', '')}00`;
    const dataFim = `${c.data.replace(/-/g, '')}T${(parseInt(c.hora.split(':')[0], 10) + 1)
      .toString()
      .padStart(2, '0')}${c.hora.split(':')[1]}00`;
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      c.descricao
    )}&dates=${dataInicio}/${dataFim}`;
    return url;
  };

  // Estatísticas dos compromissos
  const hoje = new Date().toISOString().split('T')[0];
  const agora = new Date();
  
  const stats = {
    total: compromissos.length,
    hoje: compromissos.filter(c => c.data === hoje).length,
    pendentes: compromissos.filter(c => !c.concluido).length,
    proximos: compromissos.filter(c => {
      const compromissoDate = new Date(`${c.data}T${c.hora}`);
      return compromissoDate > agora && !c.concluido;
    }).length
  };

  if (user === undefined) {
    return <div className="card-agenda">Carregando...</div>;
  }

  if (!user) {
    return <div className="card-agenda">Faça login para acessar sua agenda.</div>;
  }

  return (
    <div className="agenda-card">
      <div className="agenda-header">
        <div className="header-info">
          <div className="icon-container">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div className="header-text">
            <h3>Agenda</h3>
            <p>Gerencie seus compromissos</p>
          </div>
        </div>
        <div className="status-badges">
          <span className="badge today">{stats.hoje}</span>
          <span className="badge-label">Hoje</span>
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
          <div className="stat-value">{stats.hoje}</div>
          <div className="stat-label">Hoje</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.proximos}</div>
          <div className="stat-label">Próximos</div>
        </div>
      </div>

      <div className="agenda-content">
        <div className="add-appointment-form">
          <div className="form-row">
            <input
              type="text"
              placeholder="Descrição do compromisso..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="appointment-input description-input"
            />
          </div>
          <div className="form-row">
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="appointment-input date-input"
              title="Data do compromisso"
            />
            <input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="appointment-input time-input"
              title="Hora do compromisso"
            />
            <button
              onClick={adicionarCompromisso}
              disabled={!descricao.trim() || !data || !hora}
              className="add-btn"
              title="Adicionar compromisso"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="appointments-list">
          {compromissos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <p>Nenhum compromisso agendado</p>
              <span>Comece adicionando um novo compromisso acima!</span>
            </div>
          ) : (
            compromissos
              .sort((a, b) => {
                const dateA = new Date(`${a.data}T${a.hora}`);
                const dateB = new Date(`${b.data}T${b.hora}`);
                return dateA - dateB;
              })
              .slice(0, 5)
              .map((c) => {
                const compromissoDate = new Date(`${c.data}T${c.hora}`);
                const isToday = c.data === hoje;
                const isPast = compromissoDate < agora;
                
                return (
                  <div
                    key={c.id}
                    className={`appointment-item ${c.concluido ? 'completed' : 'pending'} ${
                      isToday ? 'today' : isPast && !c.concluido ? 'overdue' : ''
                    }`}
                  >
                    {editando === c.id ? (
                      <div className="edit-mode">
                        <div className="edit-form">
                          <input
                            ref={inputEditRef}
                            type="text"
                            value={editandoDescricao}
                            onChange={(e) => setEditandoDescricao(e.target.value)}
                            className="edit-input description-edit"
                            placeholder="Descrição..."
                          />
                          <div className="edit-datetime">
                            <input
                              type="date"
                              value={editandoData}
                              onChange={(e) => setEditandoData(e.target.value)}
                              className="edit-input date-edit"
                            />
                            <input
                              type="time"
                              value={editandoHora}
                              onChange={(e) => setEditandoHora(e.target.value)}
                              className="edit-input time-edit"
                            />
                          </div>
                        </div>
                        <div className="edit-actions">
                          <button
                            onClick={() => salvarEdicao(c.id)}
                            className="action-btn save"
                            title="Salvar alterações"
                          >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                              <polyline points="20,6 9,17 4,12"/>
                            </svg>
                          </button>
                          <button
                            onClick={cancelarEdicao}
                            className="action-btn cancel"
                            title="Cancelar edição"
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
                        <div className="appointment-content">
                          <div className="appointment-text">{c.descricao}</div>
                          <div className="appointment-info">
                            <span className="date-time">
                              {new Date(c.data).toLocaleDateString('pt-BR')} às {c.hora}
                            </span>
                            <span className={`status-tag ${
                              isToday ? 'today' : isPast && !c.concluido ? 'overdue' : 'scheduled'
                            }`}>
                              {isToday ? 'Hoje' : isPast && !c.concluido ? 'Atrasado' : 'Agendado'}
                            </span>
                            <span className={`completion-tag ${c.concluido ? 'completed' : 'pending'}`}>
                              {c.concluido ? 'Concluído' : 'Pendente'}
                            </span>
                          </div>
                        </div>
                        <div className="appointment-actions">
                          <button
                            onClick={() => concluirCompromisso(c.id, c.concluido)}
                            className={`action-btn ${c.concluido ? 'undo' : 'complete'}`}
                            title={c.concluido ? 'Marcar como pendente' : 'Marcar como concluído'}
                          >
                            {c.concluido ? (
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
                          <a
                            href={criarLinkGoogleCalendar(c)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="action-btn calendar"
                            title="Adicionar ao Google Calendar"
                          >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                              <line x1="16" y1="2" x2="16" y2="6"/>
                              <line x1="8" y1="2" x2="8" y2="6"/>
                              <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                          </a>
                          <button
                            onClick={() => iniciarEdicao(c)}
                            className="action-btn edit"
                            title="Editar compromisso"
                          >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => removerCompromisso(c.id)}
                            className="action-btn delete"
                            title="Excluir compromisso"
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
                );
              })
          )}
        </div>

        {compromissos.length > 5 && (
          <div className="more-items">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="1"/>
              <circle cx="19" cy="12" r="1"/>
              <circle cx="5" cy="12" r="1"/>
            </svg>
            <span>+{compromissos.length - 5} compromissos adicionais</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Agenda;