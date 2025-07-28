import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import "./login.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem("");

    if (!email) {
      setMensagem("Digite um e-mail válido.");
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMensagem("E-mail de redefinição enviado! Verifique sua caixa de entrada e pasta de spam.");
    } catch (error) {
      let errorMessage = "Erro ao enviar e-mail. Tente novamente.";
      
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "E-mail não encontrado. Verifique o endereço digitado.";
          break;
        case "auth/invalid-email":
          errorMessage = "E-mail inválido. Digite um endereço válido.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
          break;
        default:
          errorMessage = "Erro ao enviar e-mail. Verifique sua conexão e tente novamente.";
      }
      
      setMensagem(errorMessage);
      console.error("Erro ao redefinir senha:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-box">
        <h2>🔑 Recuperar Senha</h2>
        <p>Insira seu e-mail para receber um link de redefinição de senha seguro e rápido.</p>
        
        <form onSubmit={handleResetPassword}>
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="forgot-password-input"
          />
          
          <button 
            type="submit" 
            disabled={loading}
            className="forgot-password-submit"
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Enviando...
              </>
            ) : (
              "🚀 Enviar Link"
            )}
          </button>
        </form>
        
        {mensagem && (
          <div className={`mensagem ${mensagem.includes("Erro") || mensagem.includes("inválido") || mensagem.includes("encontrado") || mensagem.includes("tentativas") ? "error" : "success"}`}>
            {mensagem}
          </div>
        )}
        
        <button 
          onClick={() => navigate("/login")} 
          className="back-btn"
        >
          ← Voltar ao Login
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;
