import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import app, { initializeDatabase } from './backend/src/app';

async function startServer() {
  const PORT = 3000;

  // Initialize MongoDB Atlas connection before serving requests
  try {
    await initializeDatabase();
  } catch (err: any) {
    console.error('[Swipe X Server] Database initialization warning:', err?.message || err);
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Swipe X Server] Server live and listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
