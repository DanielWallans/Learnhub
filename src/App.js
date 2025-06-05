import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Login from './pages/Login';
import Home from './pages/Home';
import Cadastros from './pages/Cadastros';
import CadastroAluno from './pages/CadastroAluno';
import LoginAluno from './pages/LoginAluno';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import ForgotPassword from "./pages/Login/ForgotPassword";
import OrganizacaoPlanejamento from './components/Organizacao';
import Dashboard from './components/Dashboard';
import BoasVindas from './components/BoasVindas';

// IMPORTS DAS FUNÇÕES DO DASHBOARD
import Habitos from './components/Habitos';
import Carreira from './components/Carreira';
import Financas from './components/Financas';
import Leituras from './components/Leituras';
import Saude from './components/Saude';
import Projetos from './components/Projetos';
import Networking from './components/Networking';

// ...existing code...

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "alunos", user.uid));
        if (userDoc.exists()) {
          setUser(user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/esqueci-senha" element={<ForgotPassword />} />
          <Route path="/cadastros" element={<Cadastros />} />
          <Route path="/cadastro-aluno" element={<CadastroAluno />} />
          <Route path="/login-aluno" element={<LoginAluno />} />
          <Route path="/organizacao" element={<OrganizacaoPlanejamento />} />
          <Route path="/boas-vindas" element={<BoasVindas />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* ROTAS DAS FUNÇÕES DO DASHBOARD */}
          <Route path="/habitos" element={<PrivateRoute><Habitos /></PrivateRoute>} />
          <Route path="/carreira" element={<PrivateRoute><Carreira /></PrivateRoute>} />
          <Route path="/financas" element={<PrivateRoute><Financas /></PrivateRoute>} />
          <Route path="/leituras" element={<PrivateRoute><Leituras /></PrivateRoute>} />
          <Route path="/saude" element={<PrivateRoute><Saude /></PrivateRoute>} />
          <Route path="/projetos" element={<PrivateRoute><Projetos /></PrivateRoute>} />
          <Route path="/networking" element={<PrivateRoute><Networking /></PrivateRoute>} />

          <Route
            path="/aluno-planejamento"
            element={
              <PrivateRoute>
                <OrganizacaoPlanejamento />
              </PrivateRoute>
            }
          />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/"
            element={
              user ? <Navigate to="/home" /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/planejamento-temas"
            element={
              <PrivateRoute>
                {/* Adicione o componente correspondente aqui */}
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;