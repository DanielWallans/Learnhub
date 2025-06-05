import React, { useState } from 'react';

function Carreira() {
  const [objetivos, setObjetivos] = useState([]);
  const [novoObjetivo, setNovoObjetivo] = useState('');

  const adicionarObjetivo = () => {
    if (novoObjetivo.trim()) {
      setObjetivos([...objetivos, novoObjetivo]);
      setNovoObjetivo('');
    }
  };

  return (
    <section className="organizacao-modulo">
      <h3>🚀 Carreira</h3>
      <div className="organizacao-input-row">
        <input
          type="text"
          value={novoObjetivo}
          onChange={e => setNovoObjetivo(e.target.value)}
          placeholder="Adicionar novo objetivo de carreira"
          className="organizacao-input"
        />
        <button onClick={adicionarObjetivo} className="organizacao-btn">+</button>
      </div>
      <ul className="organizacao-list">
        {objetivos.map((objetivo, idx) => (
          <li key={idx} className="organizacao-list-item">{objetivo}</li>
        ))}
        {objetivos.length === 0 && (
          <li className="organizacao-list-empty">Nenhum objetivo adicionado.</li>
        )}
      </ul>
    </section>
  );
}

export default Carreira;