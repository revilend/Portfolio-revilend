import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// PREVIEW_HOST is only provided by the hosted preview environment, so no
// machine-specific hostnames ever end up in the repository.
const previewHost = process.env.PREVIEW_HOST;

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Three.js changes far less often than the room code that uses it, so
        // splitting it keeps the lazy chunk's caching useful.
        manualChunks: { three: ['three'] },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: previewHost ? [previewHost] : undefined,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  },
});
