import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Proxy must target the real Supabase host. Ignore if .env has a proxy path (e.g. /sb or localhost).
  const envUrl = (env.VITE_SUPABASE_URL || '').trim()
  const supabaseTarget =
    envUrl.includes('supabase.co') && envUrl.startsWith('https://')
      ? envUrl.replace(/\/$/, '')
      : 'https://tmegikggtccjqskuwpxi.supabase.co'

  return {
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/sb': {
        target: supabaseTarget,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/sb/, ''),
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            const resObj = res as import('http').ServerResponse
            if (resObj && !resObj.headersSent) {
              resObj.writeHead(502, { 'Content-Type': 'application/json' })
              resObj.end(JSON.stringify({
                error: 'Proxy error',
                message: err?.message || 'Bad Gateway',
                hint: 'Vite could not reach Supabase. Check VITE_SUPABASE_URL in .env, or try VITE_SUPABASE_USE_DIRECT=true to bypass the proxy (see docs/LOCAL_SETUP.md).',
              }))
            }
          })
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setTimeout(25000)
          })
        },
      },
    },
  },
  }
})

