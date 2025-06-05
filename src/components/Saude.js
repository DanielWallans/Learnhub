import React, { useState } from 'react';

function Saude() {
  const [atividades, setAtividades] = useState([]);
  const [novaAtividade, setNovaAtividade] = useState('');

  const adicionarAtividade = () => {
    if (novaAtividade.trim()) {
      setAtividades([...atividades, novaAtividade]);
      setNovaAtividade('');
    }
  };

  return (
    <section className="organizacao-modulo">
      <h3>🏃 Saúde & Bem-estar</h3>
      <div className="organizacao-input-row">
        <input
          type="text"
          value={novaAtividade}
          onChange={e => setNovaAtividade(e.target.value)}
          placeholder="Ex: Caminhada, Meditação"
          className="organizacao-input"
        />
        <button onClick={adicionarAtividade} className="organizacao-btn">+</button>
      </div>
      <ul className="organizacao-list">
        {atividades.map((a, idx) => (
          <li key={idx} className="organizacao-list-item">{a}</li>
        ))}
        {atividades.length === 0 && (
          <li className="organizacao-list-empty">Nenhuma atividade registrada.</li>
        )}
      </ul>
    </section>
  );
}

export default Saude;