import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeCustomizationContext = createContext();

export const useThemeCustomization = () => {
  const context = useContext(ThemeCustomizationContext);
  if (!context) {
    throw new Error('useThemeCustomization deve ser usado dentro de ThemeCustomizationProvider');
  }
  return context;
};

export const ThemeCustomizationProvider = ({ children }) => {
  const [customTheme, setCustomTheme] = useState(() => {
    const saved = localStorage.getItem('learnhub-custom-theme');
    return saved ? JSON.parse(saved) : {
      primaryColor: '#8B5CF6',
      secondaryColor: '#10B981',
      accentColor: '#F59E0B',
      backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      autoTheme: false,
      customFontSize: 'medium',
      animations: true,
      highContrast: false
    };
  });

  const [timeBasedTheme, setTimeBasedTheme] = useState('light');

  // Temas predefinidos alternativos
  const presetThemes = {
    ocean: {
      primaryColor: '#0891B2',
      secondaryColor: '#059669',
      accentColor: '#DC2626',
      backgroundGradient: 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)'
    },
    sunset: {
      primaryColor: '#EA580C',
      secondaryColor: '#DC2626',
      accentColor: '#7C3AED',
      backgroundGradient: 'linear-gradient(135deg, #F97316 0%, #EF4444 100%)'
    },
    forest: {
      primaryColor: '#059669',
      secondaryColor: '#0D9488',
      accentColor: '#8B5CF6',
      backgroundGradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
    },
    minimal: {
      primaryColor: '#374151',
      secondaryColor: '#6B7280',
      accentColor: '#9CA3AF',
      backgroundGradient: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)'
    }
  };

  // Detectar preferência de tema baseada no horário
  useEffect(() => {
    if (customTheme.autoTheme) {
      const updateTimeBasedTheme = () => {
        const hour = new Date().getHours();
        const newTheme = hour >= 6 && hour < 18 ? 'light' : 'dark';
        setTimeBasedTheme(newTheme);
      };

      updateTimeBasedTheme();
      const interval = setInterval(updateTimeBasedTheme, 60000); // Verifica a cada minuto

      return () => clearInterval(interval);
    }
  }, [customTheme.autoTheme]);

  // Aplicar tema customizado ao DOM
  useEffect(() => {
    const root = document.documentElement;
    
    // Aplicar cores customizadas
    root.style.setProperty('--color-primary-custom', customTheme.primaryColor);
    root.style.setProperty('--color-secondary-custom', customTheme.secondaryColor);
    root.style.setProperty('--color-accent-custom', customTheme.accentColor);
    root.style.setProperty('--bg-gradient-custom', customTheme.backgroundGradient);

    // Aplicar tamanho de fonte
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '20px'
    };
    root.style.setProperty('--font-size-base-custom', fontSizes[customTheme.customFontSize]);

    // Aplicar configurações de animação
    root.style.setProperty('--animations-enabled', customTheme.animations ? '1' : '0');

    // Alto contraste
    if (customTheme.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }

    // Salvar no localStorage
    localStorage.setItem('learnhub-custom-theme', JSON.stringify(customTheme));
  }, [customTheme]);

  const updateTheme = (updates) => {
    setCustomTheme(prev => ({ ...prev, ...updates }));
  };

  const applyPresetTheme = (presetName) => {
    if (presetThemes[presetName]) {
      updateTheme(presetThemes[presetName]);
    }
  };

  const resetToDefault = () => {
    const defaultTheme = {
      primaryColor: '#8B5CF6',
      secondaryColor: '#10B981',
      accentColor: '#F59E0B',
      backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      autoTheme: false,
      customFontSize: 'medium',
      animations: true,
      highContrast: false
    };
    setCustomTheme(defaultTheme);
  };

  const value = {
    customTheme,
    timeBasedTheme,
    presetThemes,
    updateTheme,
    applyPresetTheme,
    resetToDefault
  };

  return (
    <ThemeCustomizationContext.Provider value={value}>
      {children}
    </ThemeCustomizationContext.Provider>
  );
};
