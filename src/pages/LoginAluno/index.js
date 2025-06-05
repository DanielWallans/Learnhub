import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import "./loginAluno.css";

function LoginAluno() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Autenticando usuário no Firebase Authentication
      await signInWithEmailAndPassword(auth, email, senha);
      alert("Login realizado com sucesso!");
      // Redireciona para a tela de organização e planejamento do aluno
      navigate("/boas-vindas"); // Ajuste a rota conforme necessário
    } catch (error) {
      console.error("Erro ao fazer login:", error.code, error.message);
      alert("Erro ao fazer login: " + error.message);
    }
  };

  const handleBackToHome = () => {
    navigate("/home"); // Redireciona para a página inicial
  };

  return (
    <div className="login-aluno-container">
      <div className="login-aluno-box">
        <h2 className="login-aluno-title">Login de Aluno</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-aluno-input"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="login-aluno-input"
            required
          />
          <button type="submit" className="login-aluno-button">Login</button>
        </form>
        <button 
          type="button" 
          onClick={handleBackToHome} 
          className="login-aluno-button"
        >
          Voltar para o Home
        </button>
      </div>
    </div>
  );
}

export default LoginAluno;