import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import "./home.css";
import Header from "../../components/Header";
import ConvidadoPlanejamento from "../../components/ConvidadoPlanejamento";

function Home() {
  const [perfil, setPerfil] = useState("");
  const [apresentacao, setApresentacao] = useState(true);
  const [mensagemBoasVindas, setMensagemBoasVindas] = useState("");
  const [loading, setLoading] = useState(true); // Começa como `true` para exibir o spinner
  const navigate = useNavigate();

  useEffect(() => {
    // Define a mensagem de boas-vindas baseada na hora do dia
    const horaAtual = new Date().getHours();
    setMensagemBoasVindas(
      horaAtual < 12 ? "Bom dia" : horaAtual < 18 ? "Boa tarde" : "Boa noite"
    );

    // Monitora mudanças no estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
        if (userDoc.exists()) {
          setPerfil(userDoc.data().perfil);
          setApresentacao(false);
        }
      }
      setTimeout(() => setLoading(false), 500); // Pequeno atraso para suavizar a UX
    });

    return () => unsubscribe(); // Cleanup na desmontagem
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const renderPlanejamento = () => {
    if (apresentacao) {
      return (
        <Apresentacao mensagemBoasVindas={mensagemBoasVindas} setApresentacao={setApresentacao} />
      );
    }

    switch (perfil) {
      case "Aluno":
      case "Convidado":
        return <ConvidadoPlanejamento />;
      default:
        return <EscolhaPerfil setPerfil={setPerfil} navigate={navigate} />;
    }
  };

  return (
    <div className="home-container">
      <Header perfil={perfil} setPerfil={setPerfil} onLogout={handleLogout} />
      {loading ? <div className="spinner"></div> : renderPlanejamento()}
    </div>
  );
}

function Apresentacao({ mensagemBoasVindas, setApresentacao }) {
  return (
    <div className="apresentacao-container">
      <h2 className="text-2xl font-bold mt-4">{mensagemBoasVindas}, bem-vindo ao LearnHub!</h2>
      <p className="text-lg mt-2">
        O LearnHub é a plataforma onde você pode organizar suas tarefas, planejar seus estudos e gerenciar seu tempo.
      </p>
      <p className="text-lg mt-2">
        Vamos começar configurando o seu perfil para que possamos oferecer a melhor experiência possível.
      </p>
      <button onClick={() => setApresentacao(false)} className="profile-btn animate-pulse">
        Começar
      </button>
    </div>
  );
}

function EscolhaPerfil({ setPerfil, navigate }) {
  return (
    <>
      <h2 className="text-2xl font-bold mt-4">Olá!</h2>
      <p className="text-lg mt-2">Escolha como deseja entrar:</p>
      <div className="card-container-wrapper">
        <CardPerfil 
          titulo="Login de Aluno"
          descricao="Faça login com suas credenciais de aluno para acessar suas informações e planejar seus estudos."
          onClick={() => navigate("/login-aluno")}
        />
        <CardPerfil 
          titulo="Entrar como Convidado"
          descricao="Entre como convidado para explorar o LearnHub sem criar uma conta."
          onClick={() => setPerfil("Convidado")}
        />
        <CardPerfil 
          titulo="Cadastro de Aluno"
          descricao="Crie uma conta para se tornar um aluno e aproveitar todos os recursos do LearnHub."
          onClick={() => navigate("/cadastro-aluno")}
        />
      </div>
    </>
  );
}

function CardPerfil({ titulo, descricao, onClick }) {
  return (
    <div className="card-container">
      <button onClick={onClick} className="profile-btn">{titulo}</button>
      <div className="card-description">
        <p>{descricao}</p>
      </div>
    </div>
  );
}

export default Home;
