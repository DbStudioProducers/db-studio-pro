import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: './', // Crucial para o Electron carregar arquivos locais
  build: {
    target: 'esnext',
    assetsInlineLimit: 100000000, // Garante que tudo fique num único arquivo
  }
});
