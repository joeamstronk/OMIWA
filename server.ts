import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: '15mb' }));

  // In-memory backend state for session simulation & webhooks
  let serverStats = {
    uptimeStart: Date.now(),
    gatewayStatus: 'ONLINE_ACTIVE',
    totalSockets: 3,
  };

  // REST API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'OmniWatsApp Surveillance Gateway Server',
      timestamp: new Date().toISOString(),
      stats: serverStats,
    });
  });

  // Simulated Webhook endpoint to receive incoming WhatsApp messages from external providers
  app.post('/api/whatsapp/webhook', (req, res) => {
    const { from, body, messageType = 'text', channelId } = req.body;
    console.log(`[WhatsApp Webhook Received] From: ${from}, Content: ${body}`);
    res.json({
      success: true,
      messageId: `wa-wh-${Date.now()}`,
      receivedAt: new Date().toISOString(),
      status: 'queued_for_agents',
    });
  });

  // Mount Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static files
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[OmniWatsApp Surveillance] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[OmniWatsApp Surveillance Server Error]:', err);
  process.exit(1);
});
