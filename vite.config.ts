import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import sitemap from 'vite-plugin-sitemap'

const blogSlugs = [
  'family-dynamics-generational-trauma-couple-therapy',
  'understanding-managing-emotions-guide',
  'understanding-emotions-practical-ways-to-feel-better',
  'grief-in-layers-understanding-loss-healing-resilience',
]

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Proxy must target the real Supabase host. Ignore if .env has a proxy path (e.g. /sb or localhost).
  const envUrl = (env.VITE_SUPABASE_URL || '').trim()
  const supabaseTarget =
    envUrl.startsWith('https://') && envUrl.length > 10
      ? envUrl.replace(/\/$/, '')
      : 'https://api.mindfulqalb.com'

  return {
  plugins: [
    react(),
    sitemap({
      hostname: 'https://www.mindfulqalb.com',
      dynamicRoutes: [
        '/contact',
        '/blog',
        ...blogSlugs.map((s) => `/blog/${s}`),
      ],
      exclude: [
        '/admin',
        '/profile',
        '/my-bookings',
        '/auth/google/callback',
        '/404',
        '/200',
      ],
    }),
  ],
  build: {
    chunkSizeWarningLimit: 400,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router-dom') || id.includes('node_modules/scheduler')) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion'
          }
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase'
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons'
          }
          if (id.includes('node_modules/react-helmet-async')) {
            return 'vendor-helmet'
          }
          // Split admin/booking/auth pages into their own chunk (never on critical path)
          if (id.includes('/pages/AdminPage') || id.includes('/pages/BookingsPage') || id.includes('/components/BookingFlow') || id.includes('/components/PackageBookingFlow') || id.includes('/components/PaymentModal') || id.includes('/components/BookingCalendar')) {
            return 'chunk-booking'
          }
          if (id.includes('/components/auth/') || id.includes('/pages/AuthCallback')) {
            return 'chunk-auth'
          }
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

