import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import "./login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Quando currentUser é atualizado e existe, redireciona
  useEffect(() => {
    if (currentUser && !loading) {
      console.log("Login: currentUser detectado, redirecionando...");
      navigate("/home");
    }
  }, [currentUser, loading, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    try {
      console.log("Login: Iniciando autenticação...");
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;
      console.log("Login: Firebase Auth sucesso:", user.uid, user.email);
      
      // Verifica se o usuário existe na coleção "usuarios", se não existir, cria
      console.log("Login: Verificando na coleção usuarios...");
      const userDoc = await getDoc(doc(db, "usuarios", user.uid));
      console.log("Login: Documento existe na coleção usuarios:", userDoc.exists());
      
      if (!userDoc.exists()) {
        console.log("Login: Criando documento na coleção usuarios...");
        await setDoc(doc(db, "usuarios", user.uid), {
          uid: user.uid,
          email: user.email,
          criadoEm: new Date().toISOString()
        });
        console.log("Login: Documento criado com sucesso!");
      }
      
      console.log("Login: Documento criado/verificado. Aguardando AuthContext...");
      // Remove a navegação manual - deixa o useEffect fazer quando currentUser for atualizado
    } catch (error) {
      console.error("Login: Erro completo:", error);
      
      // Tratamento de diferentes tipos de erro
      let mensagemErro = "Erro ao fazer login";
      switch (error.code) {
        case "auth/user-not-found":
          mensagemErro = "Email não encontrado";
          break;
        case "auth/wrong-password":
          mensagemErro = "Senha incorreta";
          break;
        case "auth/invalid-email":
          mensagemErro = "Email inválido";
          break;
        case "auth/too-many-requests":
          mensagemErro = "Muitas tentativas. Tente novamente mais tarde";
          break;
        default:
          mensagemErro = "Verifique suas credenciais e tente novamente";
      }
      setErro(mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Logo com ícone */}
        <div className="login-header">
          <div className="login-logo-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <h1 className="login-logo">LearnHub</h1>
          <p className="login-subtitle">Acesse sua conta</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleLogin} className="login-form">
          {/* Campo Email */}
          <div className="input-group">
            <label className="input-label">Email</label>
            <div className="input-container">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Campo Senha */}
          <div className="input-group">
            <label className="input-label">Senha</label>
            <div className="input-container">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <circle cx="12" cy="16" r="1"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="login-input"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                disabled={loading}
              >
                {mostrarSenha ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mensagem de erro */}
          {erro && (
            <div className="error-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {erro}
            </div>
          )}

          {/* Botão de Login */}
          <button 
            className={`login-button ${loading ? 'loading' : ''}`} 
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Entrando...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10,17 15,12 10,7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Entrar
              </>
            )}
          </button>
        </form>

        {/* Links úteis */}
        <div className="login-links">
          <button 
            type="button"
            className="forgot-password" 
            onClick={() => navigate("/esqueci-senha")}
            disabled={loading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="8" cy="15" r="4"/>
              <path d="M10.85 12.15L19 4"/>
              <path d="M18 5l1.5-1.5"/>
              <path d="M15 8l1.5-1.5"/>
            </svg>
            Esqueci minha senha
          </button>

          <button 
            type="button"
            className="register-link" 
            onClick={() => navigate("/cadastros")}
            disabled={loading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
            Criar conta
          </button>
        </div>

        {/* Informações adicionais */}
        <div className="login-footer">
          <div className="security-info">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <circle cx="12" cy="16" r="1"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span>Seus dados estão protegidos</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
