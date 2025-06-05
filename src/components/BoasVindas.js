import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

function BoasVindas() {
  const [nome, setNome] = useState('');
  const [saudacao, setSaudacao] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Saudação dinâmica
    const hora = new Date().getHours();
    if (hora < 12) setSaudacao('Bom dia');
    else if (hora < 18) setSaudacao('Boa tarde');
    else setSaudacao('Boa noite');

    // Buscar nome do usuário logado no Firestore
    const user = auth.currentUser;
    if (user) {
      const docRef = doc(db, 'alunos', user.uid);
      getDoc(docRef).then((docSnap) => {
        if (docSnap.exists()) {
          setNome(docSnap.data().nome);
        }
      });
    }
  }, []);

  const handleComecar = () => {
    navigate('/dashboard');
  };

  return (
    <div className="dashboard-bg" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh'}}>
      <div className="dashboard-container" style={{maxWidth: 400, textAlign: 'center'}}>
        <h2 style={{fontSize: 28, marginBottom: 16}}>
          {saudacao}{nome ? `, ${nome}` : ''}! 👋
        </h2>
        <p style={{marginBottom: 32}}>Bem-vindo(a) à sua plataforma de organização e carreira!</p>
        <button className="organizacao-btn" style={{fontSize: 18, padding: '12px 32px'}} onClick={handleComecar}>
          Começar
        </button>
      </div>
    </div>
  );
}

export default BoasVindas;