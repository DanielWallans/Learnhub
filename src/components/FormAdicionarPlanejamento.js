import React, { useState } from 'react';
function FormAdicionarPlanejamento({ tipo, onAdd }) {
  const [descricao, setDescricao] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (descricao.trim() !== "") {
      onAdd({ tipo, descricao });
      setDescricao("");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        placeholder={`Adicionar ${tipo}`}
      />
      <button type="submit">Adicionar {tipo}</button>
    </form>
  );
}

export default FormAdicionarPlanejamento;