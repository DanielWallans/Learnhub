import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import './Footer.css';

const Footer = ({ minimal = false }) => {
  const currentYear = new Date().getFullYear();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  if (minimal) {
    return (
      <footer className={`footer footer-minimal ${isVisible ? 'visible' : ''}`}>
        <div className="footer-content">
          <div className="footer-minimal-content">
            <div className="footer-copyright-minimal">
              <p>
                © {currentYear} <span className="gradient-text">Daniel Wallans</span>
              </p>
              <p className="footer-subtitle">
                Desenvolvido para estudantes
              </p>
            </div>
            <div className="footer-tech-minimal">
              <span className="tech-badge">React</span>
              <span className="tech-badge">Firebase</span>
              <span className="tech-badge">JavaScript</span>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer 
      className={`footer footer-modern ${isVisible ? 'visible' : ''}`}
      onMouseMove={handleMouseMove}
    >
      {/* Background com efeito de partículas */}
      <div className="footer-background">
        <div className="particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`particle particle-${i}`}></div>
          ))}
        </div>
        <div className="gradient-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>
      </div>

      {/* Efeito de mouse cursor */}
      <div 
        className="mouse-glow" 
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
        }}
      ></div>

      <div className="footer-content">
        {/* Seção principal simplificada */}
        <div className="footer-main-simple">
          <div className="footer-brand-center">
            <div className="brand-logo">
              <div className="logo-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="brand-name">
                <span className="gradient-text">Learn</span>
                <span className="accent-text">Hub</span>
              </h3>
            </div>
            <p className="brand-description">
              Plataforma de gestão acadêmica e pessoal com foco em produtividade e organização.
            </p>
          </div>
        </div>

        {/* Separador com efeito */}
        <div className="footer-divider">
          <div className="divider-line"></div>
          <div className="divider-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="divider-line"></div>
        </div>

        {/* Footer bottom moderno */}
        <div className="footer-bottom-simple">
          <div className="footer-copyright">
            <p>
              © {currentYear} <span className="gradient-text">Daniel Wallans</span>
            </p>
            <p className="footer-subtitle">
              Transformando a educação através da tecnologia <FaStar />
            </p>
          </div>
          
          <div className="footer-tech">
            <span className="tech-label">Construído com:</span>
            <div className="tech-stack">
              <span className="tech-badge react">React</span>
              <span className="tech-badge firebase">Firebase</span>
              <span className="tech-badge js">JavaScript</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
