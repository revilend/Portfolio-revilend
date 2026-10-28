import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// PREVIEW_HOST is only provided by the hosted preview environment, so no
// machine-specific hostnames ever end up in the repository.
const previewHost = process.env.PREVIEW_HOST;

export default defineConfig({
  plugins: [react()],
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
