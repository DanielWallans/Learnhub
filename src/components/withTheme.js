import React from 'react';
import { useTheme } from '../context/ThemeContext';

// Wrapper para componentes que precisam da prop darkMode
const withTheme = (Component) => {
  return function ThemedComponent(props) {
    const { darkMode } = useTheme();
    return <Component {...props} darkMode={darkMode} />;
  };
};

export default withTheme;
