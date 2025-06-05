import React, { useState } from 'react';

function Projetos() {
  const [projetos, setProjetos] = useState([]);
  const [novoProjeto, setNovoProjeto] = useState('');

  const adicionarProjeto = () => {
    if (novoProjeto.trim()) {
      setProjetos([...projetos, novoProjeto]);
      setNovoProjeto('');
    }
  };

  return (
    <section className="organizacao-modulo">
      <h3>🛠️ Projetos</h3>
      <div className="organizacao-input-row">
        <input
          type="text"
          value={novoProjeto}
          onChange={e => setNovoProjeto(e.target.value)}
          placeholder="Adicionar novo projeto"
          className="organizacao-input"
        />
        <button onClick={adicionarProjeto} className="organizacao-btn">+</button>
      </div>
      <ul className="organizacao-list">
        {projetos.map((p, idx) => (
          <li key={idx} className="organizacao-list-item">{p}</li>
        ))}
        {projetos.length === 0 && (
          <li className="organizacao-list-empty">Nenhum projeto registrado.</li>
        )}
      </ul>
    </section>
  );
}

export default Projetos;