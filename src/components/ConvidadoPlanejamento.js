import { useState } from "react";
import styles from "./ConvidadoPlanejamento.module.css"; // Importando o CSS modular

function ConvidadoPlanejamento() {
  const [metas, setMetas] = useState([]);
  const [novaMeta, setNovaMeta] = useState("");

  const [materias, setMaterias] = useState([]);
  const [novaMateria, setNovaMateria] = useState("");

  const [tarefas, setTarefas] = useState([]);
  const [novaTarefa, setNovaTarefa] = useState("");

  const [lembretes, setLembretes] = useState([]);
  const [novoLembrete, setNovoLembrete] = useState("");

  const adicionarMeta = () => {
    if (novaMeta.trim() !== "") {
      setMetas([...metas, { texto: novaMeta, concluida: false }]);
      setNovaMeta("");
    }
  };

  const adicionarMateria = () => {
    if (novaMateria.trim() !== "") {
      setMaterias([...materias, novaMateria]);
      setNovaMateria("");
    }
  };

  const adicionarTarefa = () => {
    if (novaTarefa.trim() !== "") {
      setTarefas([...tarefas, { texto: novaTarefa, concluida: false }]);
      setNovaTarefa("");
    }
  };

  const adicionarLembrete = () => {
    if (novoLembrete.trim() !== "") {
      setLembretes([...lembretes, { texto: novoLembrete, data: new Date().toLocaleString() }]);
      setNovoLembrete("");
    }
  };

  const toggleConcluida = (lista, setLista, index) => {
    const novaLista = lista.map((item, i) =>
      i === index ? { ...item, concluida: !item.concluida } : item
    );
    setLista(novaLista);
  };

  return (
    <div className={styles.container}>
      {/* Mensagem de boas-vindas e descrição */}
      <div className={styles.welcomeSection}>
        <h2 className={styles.welcomeTitle}>Bem-vindo, Convidado!</h2>
        <p className={styles.welcomeText}>
          Você está explorando a plataforma como convidado. Cadastre-se como aluno para salvar suas tarefas e acessar recursos avançados.
        </p>
      </div>

      {/* Seção de Metas */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Metas:</h3>
        <div className={styles.inputGroup}>
          <input
            type="text"
            value={novaMeta}
            onChange={(e) => setNovaMeta(e.target.value)}
            placeholder="Digite uma nova meta"
            className={styles.input}
          />
          <button onClick={adicionarMeta} className={styles.button}>
            Adicionar Meta
          </button>
        </div>
        <div className={styles.cardGrid}>
          {metas.map((meta, index) => (
            <div key={index} className={styles.card}>
              <p className={`${styles.cardText} ${meta.concluida ? styles.lineThrough : ""}`}>
                {meta.texto}
              </p>
              <button
                onClick={() => toggleConcluida(metas, setMetas, index)}
                className={styles.cardButton}
              >
                {meta.concluida ? "Desfazer" : "Concluir"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Seção de Matérias */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Matérias:</h3>
        <div className={styles.inputGroup}>
          <input
            type="text"
            value={novaMateria}
            onChange={(e) => setNovaMateria(e.target.value)}
            placeholder="Digite uma nova matéria"
            className={styles.input}
          />
          <button onClick={adicionarMateria} className={styles.button}>
            Adicionar Matéria
          </button>
        </div>
        <div className={styles.cardGrid}>
          {materias.map((materia, index) => (
            <div key={index} className={styles.card}>
              <p className={styles.cardText}>{materia}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Seção de Tarefas */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Tarefas:</h3>
        <div className={styles.inputGroup}>
          <input
            type="text"
            value={novaTarefa}
            onChange={(e) => setNovaTarefa(e.target.value)}
            placeholder="Digite uma nova tarefa"
            className={styles.input}
          />
          <button onClick={adicionarTarefa} className={styles.button}>
            Adicionar Tarefa
          </button>
        </div>
        <div className={styles.cardGrid}>
          {tarefas.map((tarefa, index) => (
            <div key={index} className={styles.card}>
              <p className={`${styles.cardText} ${tarefa.concluida ? styles.lineThrough : ""}`}>
                {tarefa.texto}
              </p>
              <button
                onClick={() => toggleConcluida(tarefas, setTarefas, index)}
                className={styles.cardButton}
              >
                {tarefa.concluida ? "Desfazer" : "Concluir"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Seção de Lembretes Rápidos */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Lembretes Rápidos:</h3>
        <div className={styles.inputGroup}>
          <input
            type="text"
            value={novoLembrete}
            onChange={(e) => setNovoLembrete(e.target.value)}
            placeholder="Digite um novo lembrete"
            className={styles.input}
          />
          <button onClick={adicionarLembrete} className={styles.button}>
            Adicionar Lembrete
          </button>
        </div>
        <div className={styles.cardGrid}>
          {lembretes.map((lembrete, index) => (
            <div key={index} className={styles.card}>
              <p className={styles.reminderText}>{lembrete.texto}</p>
              <small className={styles.reminderDate}>{lembrete.data}</small>
            </div>
          ))}
        </div>
      </div>

      {/* Incentivo para se Cadastrar */}
      <div className={styles.alertSection}>
        <h3 className={styles.alertTitle}>Quer mais?</h3>
        <p className={styles.alertText}>
          Cadastre-se como aluno para salvar suas metas, matérias, tarefas e lembretes, além de acessar recursos avançados como sincronização de calendário e lembretes permanentes!
        </p>
        <button
          onClick={() => alert("Cadastre-se como aluno para acessar todos os recursos!")}
          className={styles.button}
        >
          Cadastre-se como Aluno
        </button>
      </div>
    </div>
  );
}

export default ConvidadoPlanejamento;