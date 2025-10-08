const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 3002;

// Enable CORS for all routes
app.use(cors());

// Proxy all requests to Ollama
app.use('/', createProxyMiddleware({
    target: 'http://localhost:11434',
    changeOrigin: true,
    onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).json({ error: 'Proxy error: ' + err.message });
    }
}));

app.listen(PORT, () => {
    console.log(`CORS proxy running on http://localhost:${PORT}`);
    console.log('Proxying requests to Ollama at http://localhost:11434');
});
