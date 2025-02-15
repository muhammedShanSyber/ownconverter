import { defineConfig } from 'vite';
import path from 'node:path';
import electron from 'vite-plugin-electron';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['pdf-parse', 'puppeteer', 'mammoth', 'docx'], // ✅ External dependencies
    },
  },
  plugins: [
    react(),
    electron([
      {
        entry: 'electron/main.ts',
        vite: {
          build: {
            rollupOptions: {
              external: ['pdf-parse', 'puppeteer', 'mammoth', 'docx'], // ✅ Ensure Vite ignores these
            },
          },
        },
      },
      {
        entry: 'electron/preload.ts',
      },
    ]),
  ],
  optimizeDeps: {
    exclude: ['pdf-parse', 'puppeteer', 'mammoth', 'docx'], // ✅ Avoid pre-bundling
  },
});
