const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Desabilitar cache completamente em desenvolvimento
      if (env === 'development') {
        webpackConfig.cache = false;
        
        // Configurar DevServer para não usar cache
        if (webpackConfig.devServer) {
          webpackConfig.devServer.headers = {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          };
        }
      }
      
      return webpackConfig;
    }
  }
};
