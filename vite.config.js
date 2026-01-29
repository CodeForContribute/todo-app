import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],

  // Build optimizations
  build: {
    // Generate source maps for production debugging
    sourcemap: mode === 'development',

    // Rollup options for code splitting
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunk for React
          'vendor-react': ['react', 'react-dom'],

          // Firebase chunk (large dependency)
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],

          // Utility libraries
          'vendor-utils': ['dompurify'],
        },
      },
    },

    // Chunk size warnings
    chunkSizeWarningLimit: 500,

    // Minification
    minify: 'esbuild',

    // Target modern browsers for smaller bundles
    target: 'es2020',
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'firebase/app', 'firebase/auth', 'firebase/firestore'],
  },

  // Performance hints
  esbuild: {
    // Drop console.log in production
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}))
