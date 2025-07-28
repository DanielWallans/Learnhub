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
    navigate("/login");
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="recuperar-senha-container">
      <div className="recuperar-senha-wrapper">
        {/* Header da página */}
        <div className="recuperar-senha-header">
          <div className="recuperar-senha-icon">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="8" cy="15" r="4"/>
              <path d="M10.85 12.15L19 4"/>
              <path d="M18 5l1.5-1.5"/>
              <path d="M15 8l1.5-1.5"/>
            </svg>
          </div>
          <h1 className="recuperar-senha-title">Recuperar Senha</h1>
          <p className="recuperar-senha-subtitle">
            {!emailSent 
              ? "Digite seu email para receber um link de recuperação"
              : "Instruções de recuperação enviadas para seu email"
            }
          </p>
        </div>

        {/* Caixa principal */}
        <div className="recuperar-senha-box">
          {!emailSent ? (
            <form onSubmit={handlePasswordReset} className="recuperar-senha-form">
              {/* Campo de email */}
              <div className="input-group">
                <label htmlFor="email" className="input-label">Email</label>
                <div className="input-container">
                  <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="recuperar-senha-input"
                    required
                    disabled={loading}
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
                className={`recuperar-senha-button ${loading ? 'loading' : ''}`}
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
                      <path d="M22 2L11 13"/>
                      <polygon points="22,2 15,22 11,13 2,9 22,2"/>
                    </svg>
                    Enviar Link
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="success-message">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
              </svg>
              <div>
                <strong>Email enviado com sucesso!</strong>
                <p style={{ margin: "8px 0 0 0", opacity: 0.9 }}>
                  Verifique sua caixa de entrada e pasta de spam. O link de recuperação expira em 1 hora.
                </p>
              </div>
            </div>
          )}

          {/* Links de navegação */}
          <div className="recuperar-senha-links">
            <button 
              type="button" 
              onClick={handleBackToLogin} 
              className="back-to-login"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15,18 9,12 15,6"/>
              </svg>
              Voltar ao Login
            </button>
            
            <button 
              type="button" 
              onClick={() => navigate("/cadastros")} 
              className="create-account"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
              Criar Conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecuperarSenha;
