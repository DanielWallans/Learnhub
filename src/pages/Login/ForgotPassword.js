import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import "./login.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!email) {
      setMensagem("Digite um e-mail válido.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMensagem("E-mail de redefinição enviado! Verifique sua caixa de entrada.");
    } catch (error) {
      setMensagem("Erro ao enviar e-mail. Tente novamente.");
      console.error("Erro ao redefinir senha:", error);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-box">
        <h2>Recuperar Senha</h2>
        <p>Insira seu e-mail para receber um link de redefinição de senha.</p>
        <form onSubmit={handleResetPassword}>
          <input
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="forgot-password-input"
          />
          <button type="submit" className="forgot-password-submit">
            Enviar Link
          </button>
        </form>
        {mensagem && <p className={`mensagem ${mensagem.includes("Erro") ? "error" : "success"}`}>{mensagem}</p>}
        <button onClick={() => navigate("/login")} className="back-btn">Voltar ao Login</button>
      </div>
    </div>
  );
}

export default ForgotPassword;
