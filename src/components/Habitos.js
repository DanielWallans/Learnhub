import React, { useState } from 'react';

function Habitos() {
  const [habitos, setHabitos] = useState([]);
  const [novoHabito, setNovoHabito] = useState('');

  const adicionarHabito = () => {
    if (novoHabito.trim()) {
      setHabitos([...habitos, novoHabito]);
      setNovoHabito('');
    }
  };

  return (
    <section className="organizacao-modulo">
      <h3>💡 Hábitos</h3>
      <div className="organizacao-input-row">
        <input
          type="text"
          value={novoHabito}
          onChange={e => setNovoHabito(e.target.value)}
          placeholder="Adicionar novo hábito"
          className="organizacao-input"
        />
        <button onClick={adicionarHabito} className="organizacao-btn">+</button>
      </div>
      <ul className="organizacao-list">
        {habitos.map((habito, idx) => (
          <li key={idx} className="organizacao-list-item">{habito}</li>
        ))}
        {habitos.length === 0 && (
          <li className="organizacao-list-empty">Nenhum hábito adicionado.</li>
        )}
      </ul>
    </section>
  );
}

export default Habitos;