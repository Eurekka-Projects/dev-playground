import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/socket.io': {
        target: 'https://dev-playground-production.up.railway.app',
        ws: true,
      },
    },
  },
});