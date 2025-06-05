import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../firebaseConfig"; 
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import "./cadastro.css";

function Cadastros() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const navigate = useNavigate();

  const handleCadastro = async (e) => {
    e.preventDefault();

    if (senha.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres!");
      return;
    }
    if (senha !== confirmSenha) {
      alert("As senhas não coincidem!");
      return;
    }

    try {
      console.log("Tentando cadastrar usuário...");
      
      // Criando usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;
      console.log("Usuário cadastrado com sucesso:", user);

      // Salvando usuário no Firestore
      await addDoc(collection(db, "usuarios"), { uid: user.uid, email });
      console.log("Usuário salvo no Firestore!");

      alert("Cadastro realizado com sucesso!");
      navigate("/home"); 

    } catch (error) {
      console.error("Erro ao cadastrar:", error.code, error.message);

      // Verifica se o usuário foi criado antes de exibir erro
      if (auth.currentUser) {
        console.log("Usuário já está autenticado:", auth.currentUser);
        alert("Cadastro realizado com sucesso!");
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
        errorMessage = `Erro desconhecido: ${error.message}`;
      }

      alert(errorMessage);
    }
  };

  return (
    <div className="cadastro-container">
      <div className="cadastro-box">
        <div className="cadastro-logo">LearnHub</div>
        <h2 className="cadastro-title">Cadastro</h2>
        <form onSubmit={handleCadastro}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="cadastro-input"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="cadastro-input"
            required
          />
          <input
            type="password"
            placeholder="Repetir Senha"
            value={confirmSenha}
            onChange={(e) => setConfirmSenha(e.target.value)}
            className="cadastro-input"
            required
          />
          <button type="submit" className="cadastro-button">Cadastrar</button>
        </form>
        <p className="cadastro-login-redirect">Já tem uma conta? <a href="/login" className="cadastro-link-login">Faça login</a></p>
      </div>
    </div>
  );
}

export default Cadastros;