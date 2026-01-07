import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      // Externalize pdfjs-dist to avoid bundling issues with Node.js-specific code
      external: ['pdfjs-dist', 'pdfjs-dist/legacy/build/pdf.mjs'],
    },
  },
});
