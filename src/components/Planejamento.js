import React, { useState } from 'react';

function Planejamento() {
  const [metas, setMetas] = useState([]);
  const [novaMeta, setNovaMeta] = useState('');

  const adicionarMeta = () => {
    if (novaMeta.trim()) {
      setMetas([...metas, novaMeta]);
      setNovaMeta('');
    }
  };

  return (
    <section className="organizacao-modulo">
      <h3>🎯 Planejamento</h3>
      <div className="organizacao-input-row">
        <input
          type="text"
          value={novaMeta}
          onChange={e => setNovaMeta(e.target.value)}
          placeholder="Adicionar nova meta"
          className="organizacao-input"
        />
        <button onClick={adicionarMeta} className="organizacao-btn">+</button>
      </div>
      <ul className="organizacao-list">
        {metas.map((meta, idx) => (
          <li key={idx} className="organizacao-list-item">{meta}</li>
        ))}
        {metas.length === 0 && (
          <li className="organizacao-list-empty">Nenhuma meta adicionada.</li>
        )}
      </ul>
    </section>
  );
}

export default Planejamento;