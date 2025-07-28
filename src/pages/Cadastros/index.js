import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../firebaseConfig"; 
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import "./cadastro.css";

function Cadastros() {
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmSenha, setMostrarConfirmSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleCadastro = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres!");
      setLoading(false);
      return;
    }
    if (senha !== confirmSenha) {
      setErro("As senhas não coincidem!");
      setLoading(false);
      return;
    }

    try {
      console.log("Tentando cadastrar usuário...");
      
      // Criando usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;
      console.log("Usuário cadastrado com sucesso:", user);

      // Salvando usuário no Firestore
      await addDoc(collection(db, "usuarios"), { 
        uid: user.uid, 
        email,
        nome,
        sobrenome,
        criadoEm: new Date().toISOString()
      });
      console.log("Usuário salvo no Firestore!");

      navigate("/home"); 

    } catch (error) {
      console.error("Erro ao cadastrar:", error.code, error.message);

      // Verifica se o usuário foi criado antes de exibir erro
      if (auth.currentUser) {
        console.log("Usuário já está autenticado:", auth.currentUser);
        navigate("/home");
        return;
      }

      // Mensagens de erro mais específicas
      let errorMessage = "Erro ao cadastrar.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Este email já está cadastrado!";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email inválido!";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "A senha deve ter pelo menos 6 caracteres!";
      } else {
        errorMessage = `Erro: ${error.message}`;
      }

      setErro(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cadastro-container">
      <div className="cadastro-box">
        {/* Header do cadastro */}
        <div className="cadastro-header">
          <div className="cadastro-logo-icon">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
          </div>
          <h1 className="cadastro-logo">LearnHub</h1>
          <p className="cadastro-subtitle">Crie sua conta</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleCadastro} className="cadastro-form">
          {/* Nome e Sobrenome */}
          <div className="input-row">
            <div className="input-group">
              <label className="input-label">Nome</label>
              <div className="input-container">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="cadastro-input"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Sobrenome</label>
              <div className="input-container">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  type="text"
                  placeholder="Seu sobrenome"
                  value={sobrenome}
                  onChange={(e) => setSobrenome(e.target.value)}
                  className="cadastro-input"
                  required
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Email */}
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
                className="cadastro-input"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Senhas */}
          <div className="input-row">
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
                  placeholder="Crie uma senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="cadastro-input"
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

            <div className="input-group">
              <label className="input-label">Confirmar Senha</label>
              <div className="input-container">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type={mostrarConfirmSenha ? "text" : "password"}
                  placeholder="Repita a senha"
                  value={confirmSenha}
                  onChange={(e) => setConfirmSenha(e.target.value)}
                  className="cadastro-input"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setMostrarConfirmSenha(!mostrarConfirmSenha)}
                  disabled={loading}
                >
                  {mostrarConfirmSenha ? (
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

          {/* Botão de Cadastro */}
          <button 
            className={`cadastro-button ${loading ? 'loading' : ''}`} 
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Criando conta...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
                Criar Conta
              </>
            )}
          </button>
        </form>

        {/* Link para login */}
        <div className="login-link">
          <p className="login-text">Já possui uma conta?</p>
          <button 
            type="button"
            className="login-button-link" 
            onClick={() => navigate("/login")}
            disabled={loading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10,17 15,12 10,7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Fazer Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cadastros;