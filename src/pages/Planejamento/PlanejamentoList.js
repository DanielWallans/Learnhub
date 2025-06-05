import { useState, useEffect } from "react";
import { db, auth } from "../../firebaseConfig";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import PlanejamentoForm from "./PlanejamentoForm";

function PlanejamentoList() {
  const [planejamentos, setPlanejamentos] = useState([]);

  useEffect(() => {
    const fetchPlanejamentos = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const q = query(collection(db, "planejamentos"), where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const lista = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPlanejamentos(lista);
      } catch (error) {
        console.error("Erro ao buscar planejamentos:", error);
      }
    };

    fetchPlanejamentos();
  }, []);

  const handleExcluir = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este planejamento?")) {
      try {
        await deleteDoc(doc(db, "planejamentos", id));
        setPlanejamentos(planejamentos.filter((item) => item.id !== id));
        alert("Planejamento excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir planejamento:", error);
        alert("Erro ao excluir.");
      }
    }
  };

  return (
    <div className="planejamento-list">
      <h2>Meus Planejamentos</h2>
      <PlanejamentoForm />
      {planejamentos.length === 0 ? (
        <p>Nenhum planejamento encontrado.</p>
      ) : (
        <ul>
          {planejamentos.map((item) => (
            <li key={item.id}>
              <h3>{item.titulo}</h3>
              <p>{item.descricao}</p>
              <p><strong>Data:</strong> {new Date(item.data.seconds * 1000).toLocaleDateString()}</p>
              <button onClick={() => handleExcluir(item.id)}>Excluir</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PlanejamentoList;
