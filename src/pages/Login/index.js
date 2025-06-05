import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import "./login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      console.log("Usuário logado:", userCredential.user);

      alert("Login realizado com sucesso!");
      navigate("/home"); // Redireciona para Home
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      alert("Erro ao fazer login: " + error.message);
    }
  };

  const handleCadastroRedirect = (e) => {
    e.preventDefault();
    navigate("/cadastros");
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-logo">Learnhub</div>
        <h2 className="login-title">Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="login-input"
            required
          />
          <button className="login-entrar" type="submit">Entrar</button>
        </form>

        {/* Novo botão para redirecionar para a página de recuperação de senha */}
        <button className="login-forgot-password" onClick={() => navigate("/esqueci-senha")}>
          Esqueci minha senha
        </button>

        <a href="/cadastros" className="login-link-register" onClick={handleCadastroRedirect}>
          Cadastrar-se
        </a>
      </div>
    </div>
  );
}

export default Login;
