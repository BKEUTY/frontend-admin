import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.js', '.jsx', '.json'],
  },
  server: {
    port: 3100,
    open: true,
  },
  build: {
    outDir: 'build',
    sourcemap: false,
    cssCodeSplit: true,
    modulePreload: false,
    chunkSizeWarningLimit: 600,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (
              id.includes('react/') ||
              id.includes('react-dom') ||
              id.includes('react-router') ||
              id.includes('@remix-run') ||
              id.includes('scheduler')
            ) {
              return 'vendor-react';
            }

            if (
              id.includes('antd') ||
              id.includes('@ant-design') ||
              id.includes('rc-')
            ) {
              return 'vendor-antd';
            }

            if (id.includes('@fontsource')) {
              return 'vendor-fonts';
            }

            if (
              id.includes('jspdf') ||
              id.includes('html2canvas') ||
              id.includes('xlsx')
            ) {
              return 'vendor-export';
            }

            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts';
            }

            if (id.includes('framer-motion')) {
              return 'vendor-animation';
            }

            if (id.includes('react-icons')) {
              return 'vendor-icons';
            }

            if (
              id.includes('@tanstack') ||
              id.includes('axios') ||
              id.includes('query-string') ||
              id.includes('decode-uri-component') ||
              id.includes('split-on-first') ||
              id.includes('filter-obj')
            ) {
              return 'vendor-data';
            }

            return 'vendor-others';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
