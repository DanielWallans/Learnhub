import { useState } from "react";
import { db, auth } from "../../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

function PlanejamentoForm() {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    try {
      await addDoc(collection(db, "planejamentos"), {
        uid: user.uid,
        titulo,
        descricao,
        data: new Date(data),
      });
      alert("Planejamento adicionado com sucesso!");
      setTitulo("");
      setDescricao("");
      setData("");
    } catch (error) {
      console.error("Erro ao adicionar planejamento:", error);
      alert("Erro ao adicionar planejamento.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Título:</label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Descrição:</label>
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Data:</label>
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          required
        />
      </div>
      <button type="submit">Adicionar Planejamento</button>
    </form>
  );
}

export default PlanejamentoForm;
