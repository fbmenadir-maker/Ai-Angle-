import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // Capture keys from process.env (injected by AI Studio) or .env files
  const DEFAULT_KEY = "AIzaSyAicCjApoi8vl3TM7s9cpOls8ABTnebvcw";
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || (env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY' ? '' : env.GEMINI_API_KEY) || DEFAULT_KEY;
  const API_KEY = process.env.API_KEY || (env.API_KEY === 'MY_APP_URL' ? '' : env.API_KEY) || '';

  return {
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(GEMINI_API_KEY),
      'process.env.API_KEY': JSON.stringify(API_KEY),
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
