import React, { useState, useEffect } from 'react';

function Agenda() {
  const [compromissos, setCompromissos] = useState([]);
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');

  // Solicita permissão para notificações ao carregar o componente
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Notifica compromissos do dia e hora marcada
  useEffect(() => {
    const agora = new Date();
    compromissos.forEach((c, idx) => {
      const dataHora = new Date(`${c.data}T${c.hora}`);
      // Notifica se for o mesmo dia e hora/minuto igual ao atual
      if (
        dataHora.getFullYear() === agora.getFullYear() &&
        dataHora.getMonth() === agora.getMonth() &&
        dataHora.getDate() === agora.getDate() &&
        dataHora.getHours() === agora.getHours() &&
        dataHora.getMinutes() === agora.getMinutes() &&
        !c.notificado
      ) {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Lembrete de compromisso", {
            body: `${c.descricao} às ${c.hora}`,
          });
        }
        // Marca como notificado
        setCompromissos(prev =>
          prev.map((item, i) =>
            i === idx ? { ...item, notificado: true } : item
          )
        );
      }
    });
  }, [compromissos]);

  const adicionarCompromisso = () => {
    if (descricao.trim() && data && hora) {
      setCompromissos([
        ...compromissos,
        { descricao, data, hora, notificado: false }
      ]);
      setDescricao('');
      setData('');
      setHora('');
    }
  };

  // Função para criar link do Google Calendar
  const criarLinkGoogleCalendar = (c) => {
    const dataInicio = `${c.data.replace(/-/g, '')}T${c.hora.replace(':', '')}00`;
    // 1h de duração
    const dataFim = `${c.data.replace(/-/g, '')}T${(parseInt(c.hora.split(':')[0], 10) + 1)
      .toString()
      .padStart(2, '0')}${c.hora.split(':')[1]}00`;
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      c.descricao
    )}&dates=${dataInicio}/${dataFim}`;
    return url;
  };

  return (
    <section className="organizacao-modulo">
      <h3>📅 Agenda</h3>
      <div className="organizacao-input-row">
        <input
          type="text"
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
          placeholder="Descrição do compromisso"
          className="organizacao-input"
        />
        <input
          type="date"
          value={data}
          onChange={e => setData(e.target.value)}
          className="organizacao-input"
        />
        <input
          type="time"
          value={hora}
          onChange={e => setHora(e.target.value)}
          className="organizacao-input"
        />
        <button onClick={adicionarCompromisso} className="organizacao-btn">+</button>
      </div>
      <ul className="organizacao-list">
        {compromissos.map((c, idx) => (
          <li key={idx} className="organizacao-list-item">
            <strong>{c.data} {c.hora}:</strong> {c.descricao}
            <br />
            <a
              href={criarLinkGoogleCalendar(c)}
              target="_blank"
              rel="noopener noreferrer"
              className="organizacao-btn"
              style={{marginTop: 6, display: 'inline-block', fontSize: 14}}
            >
              Adicionar ao Google Calendar
            </a>
          </li>
        ))}
        {compromissos.length === 0 && (
          <li className="organizacao-list-empty">Nenhum compromisso agendado.</li>
        )}
      </ul>
    </section>
  );
}

export default Agenda;