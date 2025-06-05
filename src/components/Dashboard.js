import React, { useEffect, useState } from 'react';
import Resumo from './Resumo';
import Organizacao from './Organizacao';
import Planejamento from './Planejamento';
import Habitos from './Habitos';
import Carreira from './Carreira';
import Financas from './Financas';
import Leituras from './Leituras';
import Saude from './Saude';
import Projetos from './Projetos';
import Networking from './Networking';
import Agenda from './Agenda';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './organizacao.css';
import './modalPerfil.css';
import './Cabecalho.css';
import './dashboard-nav.css';
// ...existing code...

function Cabecalho() {
  const [nome, setNome] = useState('');
  const [foto, setFoto] = useState('');
  const [showPerfil, setShowPerfil] = useState(false);
  const [dadosAluno, setDadosAluno] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const docRef = doc(db, 'alunos', user.uid);
      getDoc(docRef).then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setNome(data.nomeCompleto || data.nome || '');
          setFoto(data.foto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(data.nomeCompleto || data.nome || 'Aluno'));
          setDadosAluno(data);
        }
      });
    }
  }, [user]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login-aluno');
  };

  const handleOpenPerfil = () => {
    setShowPerfil(true);
  };

  return (
    <>
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <button className="dashboard-icon-btn" title="Notificações" aria-label="Notificações">
            <svg width="22" height="22" fill="none" stroke="#4c6ef5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
          </button>
        </div>
        <div className="dashboard-header-right">
          <span className="dashboard-profile" onClick={handleOpenPerfil} style={{cursor: 'pointer'}}>
            <img src={foto} alt="Perfil" className="dashboard-profile-img" />
            <span className="dashboard-profile-nome">{nome}</span>
          </span>
          <button className="dashboard-logout-btn" onClick={handleLogout}>Sair</button>
        </div>
      </header>
      
      {showPerfil && (
        <div className="modal-perfil-bg">
          <div className="modal-perfil">
            <h3>Meu Cadastro</h3>
            <div><strong>Nome Completo:</strong> {dadosAluno?.nomeCompleto || "Não informado"}</div>
            <div><strong>Email para Contato:</strong> {dadosAluno?.emailContato || "Não informado"}</div>
            <div><strong>Email:</strong> {dadosAluno?.email || "Não informado"}</div>
            <div><strong>Matrícula:</strong> {dadosAluno?.matricula || "Não informado"}</div>
            <div><strong>Nível de Ensino:</strong> {dadosAluno?.nivelEnsino || "Não informado"}</div>
            <div><strong>Curso:</strong> {dadosAluno?.curso || "Não informado"}</div>
            <div><strong>Semestre/Período Atual:</strong> {dadosAluno?.semestrePeriodo || "Não informado"}</div>
            <div><strong>Modalidade:</strong> {dadosAluno?.modalidade || "Não informado"}</div>
            <div className="modal-perfil-avatar">
              <img src={dadosAluno?.foto || foto} alt="Avatar" />
            </div>
            <div style={{marginTop: 16}}>
              <button className="dashboard-logout-btn" onClick={() => setShowPerfil(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Dashboard () {
  return (
    <div className="dashboard-bg">
      <div className="dashboard-container">
        <Cabecalho />
        {/* Menu de navegação para as outras funções */}
        <nav className="dashboard-nav" style={{margin: '16px 0', display: 'flex', gap: 16}}>
          <Link to="/habitos">Hábitos</Link>
          <Link to="/carreira">Carreira</Link>
          <Link to="/financas">Finanças</Link>
          <Link to="/leituras">Leituras</Link>
          <Link to="/saude">Saúde</Link>
          <Link to="/projetos">Projetos</Link>
          <Link to="/networking">Networking</Link>
        </nav>
        <Resumo />
        <div className="dashboard-modulos">
          <Organizacao />
          <Planejamento />
          <Agenda />
        </div>
      </div>
    </div>
  );
}
export default Dashboard;