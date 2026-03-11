import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // ─── Proxy API calls to the backend during development ───
  // When the frontend makes a request to /api/..., Vite forwards it
  // to http://localhost:5001 so we don't get CORS issues in dev mode.
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});
