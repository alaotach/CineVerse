// This file configures the development proxy to handle API requests

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Set up the proxy target with a timeout
  const proxyOptions = {
    target: process.env.API_PROXY || 'http://localhost:8080', // Updated to port 8080
    changeOrigin: true,
    pathRewrite: {
      '^/api': '/'
    },
    timeout: 5000,
    logLevel: 'warn',
    onError: (err, req, res) => {
      console.log('[Proxy Error]:', err.message);
      res.status(503).json({
        error: 'Service Unavailable',
        message: 'API server is unreachable',
      });
    }
  };

  // Register the proxy middleware for all API routes
  app.use('/api', createProxyMiddleware(proxyOptions));
  
  // Log all API requests
  app.use('/api', (req, res, next) => {
    console.log(`Sending request to: ${req.url}`);
    next();
  });
};
