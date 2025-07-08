import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import './dashboard-resumo.css';

function Resumo() {
  const [dadosResumo, setDadosResumo] = useState({
    ultimaAtividade: 'Hoje',
    progressoSemanal: 0,
    diasConsecutivos: 0
  });

  const [horaAtual, setHoraAtual] = useState(new Date());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ouça autenticação
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Calcular estatísticas reais
  useEffect(() => {
    if (!user) {
      setDadosResumo(prev => ({ 
        ...prev, 
        diasConsecutivos: 0, 
        progressoSemanal: 0 
      }));
      return;
    }

    // Buscar hábitos concluídos para calcular streak
    const habitosQuery = query(
      collection(db, 'habitos'),
      where('uid', '==', user.uid)
    );

    const unsubscribeHabitos = onSnapshot(habitosQuery, (snapshot) => {
      const hoje = new Date();
      const diasConsecutivos = calcularDiasConsecutivos(snapshot.docs, hoje);
      const progressoSemanal = calcularProgressoSemanal(snapshot.docs, hoje);
      
      setDadosResumo(prev => ({ 
        ...prev, 
        diasConsecutivos, 
        progressoSemanal 
      }));
    });

    return () => unsubscribeHabitos();
  }, [user]);

  // Função para calcular dias consecutivos
  const calcularDiasConsecutivos = (habitos, hoje) => {
    if (habitos.length === 0) return 0;
    
    let diasConsecutivos = 0;
    const dataAtual = new Date(hoje);
    
    // Verificar os últimos 30 dias
    for (let i = 0; i < 30; i++) {
      const dataVerificar = new Date(dataAtual);
      dataVerificar.setDate(dataAtual.getDate() - i);
      const dataString = dataVerificar.toISOString().split('T')[0];
      
      let temHabitoHoje = false;
      
      // Verificar se algum hábito foi concluído neste dia
      habitos.forEach(doc => {
        const habito = doc.data();
        if (habito.diasConcluidos && habito.diasConcluidos.includes(dataString)) {
          temHabitoHoje = true;
        }
      });
      
      if (temHabitoHoje) {
        diasConsecutivos++;
      } else {
        break; // Para a contagem quando encontra um dia sem hábito
      }
    }
    
    return diasConsecutivos;
  };

  // Função para calcular progresso semanal
  const calcularProgressoSemanal = (habitos, hoje) => {
    if (habitos.length === 0) return 0;
    
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay()); // Domingo
    
    let totalHabitos = 0;
    let habitosConcluidos = 0;
    
    // Contar hábitos da semana
    for (let i = 0; i < 7; i++) {
      const dataVerificar = new Date(inicioSemana);
      dataVerificar.setDate(inicioSemana.getDate() + i);
      const dataString = dataVerificar.toISOString().split('T')[0];
      
      habitos.forEach(doc => {
        const habito = doc.data();
        if (habito.ativo !== false) { // Só contar hábitos ativos
          totalHabitos++;
          if (habito.diasConcluidos && habito.diasConcluidos.includes(dataString)) {
            habitosConcluidos++;
          }
        }
      });
    }
    
    return totalHabitos > 0 ? Math.round((habitosConcluidos / totalHabitos) * 100) : 0;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setHoraAtual(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getSaudacao = () => {
    const hora = horaAtual.getHours();
    if (hora < 12) return 'Bom dia';
    if (hora < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getDataFormatada = () => {
    return horaAtual.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <section className="dashboard-resumo">
      <div className="resumo-card">
        <div className="resumo-header">
          <div className="resumo-saudacao-container">
            <h2 className="resumo-saudacao">
              {getSaudacao()}!
              <span className="resumo-emoji">
                {getSaudacao() === 'Bom dia' ? '🌅' : getSaudacao() === 'Boa tarde' ? '☀️' : '🌙'}
              </span>
            </h2>
            <p className="resumo-data">{getDataFormatada()}</p>
          </div>
          <div className="resumo-time">
            <span className="current-time">
              {horaAtual.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
            </span>
          </div>
        </div>

        <div className="resumo-stats">
          <div className="resumo-stat">
            <div className="resumo-stat-icon streak">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/>
              </svg>
            </div>
            <div className="resumo-stat-content">
              <span className="resumo-stat-number">
                {loading ? '⏳' : dadosResumo.diasConsecutivos}
              </span>
              <span className="resumo-stat-label">Dias Consecutivos</span>
            </div>
          </div>

          <div className="resumo-stat">
            <div className="resumo-stat-icon progress">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
                <polyline points="17,6 23,6 23,12"/>
              </svg>
            </div>
            <div className="resumo-stat-content">
              <span className="resumo-stat-number">
                {loading ? '⏳' : `${dadosResumo.progressoSemanal}%`}
              </span>
              <span className="resumo-stat-label">Progresso Semanal</span>
            </div>
          </div>
        </div>

        <div className="resumo-atividades">
          <div className="atividades-header">
            <h3 className="atividades-titulo">
              <span className="atividades-icon">📈</span>
              Atividade Recente
            </h3>
          </div>
          
          <div className="atividades-list">
            <div className="atividade-item">
              <div className="atividade-icon success">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
              </div>
              <div className="atividade-content">
                <span className="atividade-texto">Hábito de leitura completado</span>
                <span className="atividade-tempo">2h atrás</span>
              </div>
            </div>
            
            <div className="atividade-item">
              <div className="atividade-icon time">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
              </div>
              <div className="atividade-content">
                <span className="atividade-texto">Meta de exercícios atingida</span>
                <span className="atividade-tempo">5h atrás</span>
              </div>
            </div>
            
            <div className="atividade-item">
              <div className="atividade-icon book">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                </svg>
              </div>
              <div className="atividade-content">
                <span className="atividade-texto">Novo livro adicionado</span>
                <span className="atividade-tempo">1 dia atrás</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Resumo;