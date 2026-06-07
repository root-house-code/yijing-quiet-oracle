import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Fully client-side, deployable as a static site. No backend, no network at runtime.
export default defineConfig({
  plugins: [react()],
  base: './',
  test: {
    environment: 'node',
    include: ['src/**/*.test.js', 'src/**/*.test.jsx'],
  },
});
