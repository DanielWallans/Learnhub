import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Login from './pages/Login';
import Home from './pages/Home';
import Cadastros from './pages/Cadastros';
import CadastroAluno from './pages/CadastroAluno';
import LoginAluno from './pages/LoginAluno';
import RecuperarSenha from './pages/RecuperarSenha';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import Loading from './components/Loading';
import ForgotPassword from "./pages/Login/ForgotPassword";
import OrganizacaoPlanejamento from './components/Organizacao';
import Dashboard from './components/Dashboard';
import BoasVindas from './components/BoasVindas';

// imports dos módulos do dashboard - organizados de forma mais casual
import Habitos from './components/Habitos';
import Carreira from './components/Carreira';
import Financas from './components/Financas';
import Leituras from './components/Leituras';
import Saude from './components/Saude';
import Projetos from './components/Projetos';

// ...existing code...

function App() {
  const [loading, setLoading] = useState(true);
  // const [user, setUser] = useState(null); // não tô usando isso aqui mesmo

  // monitoramento de auth - meio que simples mas funciona
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // verifica se o usuário realmente existe no firestore
        const userDoc = await getDoc(doc(db, "alunos", user.uid));
        if (userDoc.exists()) {
          // setUser(user); // comentei porque não tô usando
        } else {
          // setUser(null);
        }
      } else {
        // setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // loading simples - talvez devesse ser mais bonito mas por enquanto tá ok
  if (loading) {
    return <Loading message="Inicializando aplicação..." size="large" />;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* rotas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/esqueci-senha" element={<ForgotPassword />} />
            <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="/cadastros" element={<Cadastros />} />
          <Route path="/cadastro-aluno" element={<CadastroAluno />} />
          <Route path="/login-aluno" element={<LoginAluno />} />
          <Route path="/organizacao" element={<OrganizacaoPlanejamento />} />
          <Route path="/boas-vindas" element={<BoasVindas />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* módulos do dashboard - todos com PrivateRoute pra proteção */}
          <Route path="/habitos" element={<PrivateRoute><Habitos /></PrivateRoute>} />
          <Route path="/carreira" element={<PrivateRoute><Carreira /></PrivateRoute>} />
          <Route path="/financas" element={<PrivateRoute><Financas /></PrivateRoute>} />
          <Route path="/leituras" element={<PrivateRoute><Leituras /></PrivateRoute>} />
          <Route path="/saude" element={<PrivateRoute><Saude /></PrivateRoute>} />
          <Route path="/projetos" element={<PrivateRoute><Projetos /></PrivateRoute>} />

          {/* algumas rotas específicas do sistema */}
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
            element={<Home />}
          />
          <Route
            path="/planejamento-temas"
            element={
              <PrivateRoute>
                {/* TODO: adicionar o componente correspondente aqui quando tiver pronto */}
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;