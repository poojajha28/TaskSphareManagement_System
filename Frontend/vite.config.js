// Last Updated: May 13, 2026
    // vite.config.js
    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';
    import tailwindcss from '@tailwindcss/vite';

    export default defineConfig({
      plugins: [
        react(),
        tailwindcss(),
      ],
    });