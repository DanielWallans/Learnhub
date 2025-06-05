import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../firebaseConfig";
import { createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { collection, setDoc, doc, getDocs, query, where } from "firebase/firestore";
import "./cadastroAluno.css";

function CadastroAluno() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [matricula, setMatricula] = useState("");
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [emailContato, setEmailContato] = useState("");
  const [nivelEnsino, setNivelEnsino] = useState("");
  const [anoSerie, setAnoSerie] = useState("");
  const [nomeEscola, setNomeEscola] = useState("");
  const [turno, setTurno] = useState("");
  const [nomeInstituicao, setNomeInstituicao] = useState("");
  const [curso, setCurso] = useState("");
  const [semestrePeriodo, setSemestrePeriodo] = useState("");
  const [modalidade, setModalidade] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDocs(query(collection(db, "alunos"), where("uid", "==", user.uid)));
        if (!userDoc.empty) {
          navigate("/home");
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

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
      // Criando usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      // Salvando usuário no Firestore com o ID igual ao user.uid
      await setDoc(doc(db, "alunos", user.uid), { 
        uid: user.uid, 
        email, 
        matricula, 
        nomeCompleto, 
        dataNascimento, 
        cpf, 
        telefone, 
        emailContato, 
        nivelEnsino, 
        anoSerie, 
        nomeEscola, 
        turno, 
        nomeInstituicao, 
        curso, 
        semestrePeriodo, 
        modalidade 
      });
      alert("Cadastro realizado com sucesso!");
      navigate("/login-aluno"); // Redirecionando para a página de login
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        alert("Este e-mail já está cadastrado. Faça login ou use outro e-mail.");
      } else {
        alert("Erro ao cadastrar: " + error.message);
      }
      console.error("Erro ao cadastrar:", error.code, error.message);
    }
  };

  const gerarMatricula = async () => {
    let novaMatricula;
    let matriculaExiste = true;

    while (matriculaExiste) {
      novaMatricula = "MAT-" + Math.floor(Math.random() * 1000000);
      const q = query(collection(db, "alunos"), where("matricula", "==", novaMatricula));
      const querySnapshot = await getDocs(q);
      matriculaExiste = !querySnapshot.empty;
    }

    setMatricula(novaMatricula);
  };

  return (
    <div className="cadastro-aluno-container">
      <div className="cadastro-aluno-box">
        <h2 className="cadastro-aluno-title">Cadastro de Aluno</h2>
        <form onSubmit={handleCadastro} className="cadastro-aluno-form">
          <input
            type="text"
            placeholder="Nome Completo"
            value={nomeCompleto}
            onChange={(e) => setNomeCompleto(e.target.value)}
            className="cadastro-aluno-input"
            required
          />
          <input
            type="date"
            placeholder="Data de Nascimento"
            value={dataNascimento}
            onChange={(e) => setDataNascimento(e.target.value)}
            className="cadastro-aluno-input"
            required
          />
          <input
            type="text"
            placeholder="CPF"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            className="cadastro-aluno-input"
            required
          />
          <input
            type="text"
            placeholder="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="cadastro-aluno-input"
            required
          />
          <input
            type="email"
            placeholder="Email para Contato"
            value={emailContato}
            onChange={(e) => setEmailContato(e.target.value)}
            className="cadastro-aluno-input"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="cadastro-aluno-input"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="cadastro-aluno-input"
            required
          />
          <input
            type="password"
            placeholder="Repetir Senha"
            value={confirmSenha}
            onChange={(e) => setConfirmSenha(e.target.value)}
            className="cadastro-aluno-input"
            required
          />
          <button type="button" onClick={gerarMatricula} className="cadastro-aluno-button">
            Gerar Matrícula
          </button>
          <input
            type="text"
            placeholder="Matrícula"
            value={matricula}
            readOnly
            className="cadastro-aluno-input"
          />
          <select
            value={nivelEnsino}
            onChange={(e) => setNivelEnsino(e.target.value)}
            className="cadastro-aluno-input"
            required
          >
            <option value="">Selecione o Nível de Ensino</option>
            <option value="Ensino Fundamental">Ensino Fundamental</option>
            <option value="Ensino Médio">Ensino Médio</option>
            <option value="Ensino Superior">Ensino Superior</option>
          </select>
          {nivelEnsino === "Ensino Fundamental" || nivelEnsino === "Ensino Médio" ? (
            <>
              <input
                type="text"
                placeholder="Ano/Série Atual"
                value={anoSerie}
                onChange={(e) => setAnoSerie(e.target.value)}
                className="cadastro-aluno-input"
                required
              />
              <input
                type="text"
                placeholder="Nome da Escola"
                value={nomeEscola}
                onChange={(e) => setNomeEscola(e.target.value)}
                className="cadastro-aluno-input"
                required
              />
              <select
                value={turno}
                onChange={(e) => setTurno(e.target.value)}
                className="cadastro-aluno-input"
                required
              >
                <option value="">Selecione o Turno</option>
                <option value="Manhã">Manhã</option>
                <option value="Tarde">Tarde</option>
                <option value="Noite">Noite</option>
              </select>
            </>
          ) : null}
          {nivelEnsino === "Ensino Superior" ? (
            <>
              <input
                type="text"
                placeholder="Nome da Instituição"
                value={nomeInstituicao}
                onChange={(e) => setNomeInstituicao(e.target.value)}
                className="cadastro-aluno-input"
                required
              />
              <input
                type="text"
                placeholder="Curso"
                value={curso}
                onChange={(e) => setCurso(e.target.value)}
                className="cadastro-aluno-input"
                required
              />
              <input
                type="text"
                placeholder="Semestre/Período Atual"
                value={semestrePeriodo}
                onChange={(e) => setSemestrePeriodo(e.target.value)}
                className="cadastro-aluno-input"
                required
              />
              <select
                value={modalidade}
                onChange={(e) => setModalidade(e.target.value)}
                className="cadastro-aluno-input"
                required
              >
                <option value="">Selecione a Modalidade</option>
                <option value="Presencial">Presencial</option>
                <option value="EAD">EAD</option>
                <option value="Híbrido">Híbrido</option>
              </select>
            </>
          ) : null}
          <button type="submit" className="cadastro-aluno-button">Cadastrar</button>
        </form>
        <div className="button-group">
          <button onClick={() => navigate('/login-aluno')} className="cadastro-aluno-button">
            Já é cadastrado? Faça login
          </button>
          <button onClick={() => navigate('/home')} className="cadastro-aluno-button">
            Volte para o Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default CadastroAluno;