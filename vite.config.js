import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      rollup: '@rollup/wasm-node'
    }
  },
  server: {
    port: 3000,
    host: true
  }
});

