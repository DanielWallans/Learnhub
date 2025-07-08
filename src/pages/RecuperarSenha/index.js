import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import "./recuperarSenha.css";

function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, digite um email válido");
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email, {
        url: window.location.origin + '/login-aluno', // URL para redirecionamento após reset
        handleCodeInApp: false
      });
      setEmailSent(true);
      setMessage("Email de recuperação enviado! Verifique sua caixa de entrada e spam.");
    } catch (error) {
      console.error("Erro ao enviar email de recuperação:", error.code, error.message);
      
      let errorMessage = "Erro ao enviar email de recuperação";
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "Não encontramos uma conta com este email";
          break;
        case "auth/invalid-email":
          errorMessage = "Email inválido";
          break;
        case "auth/too-many-requests":
          errorMessage = "Muitas tentativas. Tente novamente em alguns minutos";
          break;
        case "auth/user-disabled":
          errorMessage = "Esta conta foi desabilitada. Entre em contato com o suporte";
          break;
        default:
          errorMessage = "Erro ao enviar email. Verifique sua conexão e tente novamente";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login-aluno");
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleResendEmail = () => {
    setEmailSent(false);
    setMessage("");
    setError("");
  };

  return (
    <div className="recuperar-senha-container">
      <div className="recuperar-senha-wrapper">
        {/* Header com logo e título */}
        <div className="recuperar-header">
          <div className="logo-container">
            <div className="logo-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <h1 className="logo-text">LearnHub</h1>
          </div>
          <div className="title-badge">
            <span className="badge-text">Recuperação de Senha</span>
          </div>
          <h2 className="recuperar-title">Redefina sua senha</h2>
          <p className="recuperar-subtitle">
            {!emailSent 
              ? "Digite seu email para receber o link de recuperação"
              : "Email enviado com sucesso! Verifique sua caixa de entrada"
            }
          </p>
        </div>

        {/* Conteúdo principal */}
        <div className="recuperar-senha-box">
          {!emailSent ? (
            <form onSubmit={handlePasswordReset} className="recuperar-form">
              {/* Campo de email */}
              <div className="input-group">
                <label htmlFor="email" className="input-label">Email cadastrado</label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    id="email"
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="recuperar-input"
                    required
                  />
                </div>
              </div>

              {/* Mensagem de erro */}
              {error && (
                <div className="error-message">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  {error}
                </div>
              )}

              {/* Botão de enviar */}
              <button 
                type="submit" 
                className={`recuperar-button ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 12h.01"/>
                      <path d="M12 12h.01"/>
                      <path d="M16 12h.01"/>
                      <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                      <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                    </svg>
                    Enviar Link de Recuperação
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="success-content">
              {/* Ícone de sucesso */}
              <div className="success-icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22,4 12,14.01 9,11.01"/>
                </svg>
              </div>

              {/* Mensagem de sucesso */}
              {message && (
                <div className="success-message">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4"/>
                    <path d="M22 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                  </svg>
                  {message}
                </div>
              )}

              {/* Instruções */}
              <div className="instructions">
                <h3>✨ Próximos passos:</h3>
                <div className="instruction-steps">
                  <div className="step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <strong>Verifique seu email:</strong> <span className="email-highlight">{email}</span>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <strong>Confira o spam:</strong> Caso não encontre na caixa de entrada
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <strong>Clique no link:</strong> Para redefinir sua senha
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <strong>Crie uma nova senha:</strong> Segura e memorável
                    </div>
                  </div>
                </div>
              </div>

              {/* Botão para reenviar */}
              <button 
                type="button" 
                onClick={handleResendEmail}
                className="resend-button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23,4 23,10 17,10"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                Reenviar Email
              </button>
            </div>
          )}

          {/* Botões de navegação */}
          <div className="recuperar-footer">
            <button 
              type="button" 
              onClick={handleBackToLogin} 
              className="back-button secondary"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15,18 9,12 15,6"/>
              </svg>
              Voltar ao Login
            </button>
            
            <button 
              type="button" 
              onClick={handleBackToHome} 
              className="back-button primary"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
              Início
            </button>
          </div>
        </div>

        {/* Rodapé com informações de segurança */}
        <div className="security-info">
          <div className="security-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <circle cx="12" cy="16" r="1"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span>Recuperação segura</span>
          </div>
          <div className="security-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>Dados protegidos</span>
          </div>
          <div className="security-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4"/>
              <path d="M22 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
            </svg>
            <span>Processo rápido</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecuperarSenha;
