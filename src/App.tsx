import { useEffect, useState, lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, RouterProvider, Navigate, useLocation, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AppErrorBoundary, NotFoundPage } from './components/AppErrorBoundary'
import { Outlet } from 'react-router-dom'
import { cleanupLegacyStorage } from './utils/secureStorage'
import Navigation from './components/Navigation'
import Hero from './components/Hero'
import TrustSignals from './components/TrustSignals'
import Services from './components/Services'
import AboutTherapist from './components/AboutTherapist'
import TherapeuticApproach from './components/TherapeuticApproach'
import GetHelp from './components/GetHelp'
import Footer from './components/Footer'
import FAQ from './components/FAQ'
import Chatbot from './components/Chatbot'
import StickyBookCta from './components/StickyBookCta'
import WhoThisIsFor from './components/WhoThisIsFor'
import HowItWorks from './components/HowItWorks'
import ClientTestimonials from './components/ClientTestimonials'

const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'))
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'))
const MyBookingsPage = lazy(() => import('./pages/MyBookingsPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const BlogListPage = lazy(() => import('./pages/BlogListPage'))
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'))

const LazyFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-pulse flex flex-col items-center gap-3">
      <div className="w-10 h-10 rounded-full border-2 border-lavender-200 border-t-lavender-600 animate-spin" />
      <p className="text-sm text-gray-500">Loading...</p>
    </div>
  </div>
)

// OAuth callback: when session appears redirect to home; after timeout show "Go home" so user isn't stuck on "Signing in…"
const AuthCallbackPage = () => {
  const { session, loading: authLoading } = useAuth()
  const [showFallback, setShowFallback] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShowFallback(true), 12000)
    return () => clearTimeout(t)
  }, [])
  if (session) return <Navigate to="/" replace />
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#6b7280', gap: 16 }}>
      <div className="w-10 h-10 rounded-full border-2 border-lavender-200 border-t-lavender-600 animate-spin" />
      <p className="text-sm">Signing in…</p>
      {showFallback && (
        <p style={{ marginTop: 8 }}>
          <Link to="/" style={{ color: '#8B7EC8', fontWeight: 600 }}>Go to home</Link>
          {authLoading ? ' — still completing sign-in' : ''}
        </p>
      )}
    </div>
  )
}

// Home page component
const HomePage = () => {
  const location = useLocation()

  useEffect(() => {
    const hash = location.hash.replace('#', '')
    if (hash) {
      const el = document.getElementById(hash)
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
      }
    }
  }, [location.hash])

  useEffect(() => {
    // Clean up any legacy localStorage data that contained PII
    cleanupLegacyStorage();
  }, [])

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <Helmet>
        <title>Mindful QALB | Evidence-Based Mental Health Care for Individuals & Couples</title>
        <meta name="description" content="Online therapy and counseling by a licensed psychologist. Individual and couples therapy via video, audio, or chat. Book a free 15-minute consultation." />
        <link rel="canonical" href="https://www.mindfulqalb.com/" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Mindful QALB | Evidence-Based Mental Health Care for Individuals & Couples" />
        <meta property="og:description" content="Online therapy and counseling by a licensed psychologist. Individual and couples therapy. Book a free 15-minute consultation." />
        <meta property="og:url" content="https://www.mindfulqalb.com/" />
        <meta property="og:image" content="https://www.mindfulqalb.com/og-image.png" />
      </Helmet>
      {/* Skip to content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-lavender-600 focus:text-white focus:rounded-lg focus:outline-none"
      >
        Skip to main content
      </a>
      
      <Navigation />
      <main id="main-content" className="pb-24 md:pb-0">
        <Hero />
        <WhoThisIsFor />
        <AboutTherapist />
        <TrustSignals />
        <Services />
        <ClientTestimonials />
        <TherapeuticApproach />
        <HowItWorks />
        <GetHelp />
        <FAQ />
      </main>
      <Footer />
      <StickyBookCta />
      
      {/* Floating Chatbot */}
      <Chatbot />
    </div>
  )
}

/** Protects /admin: only allows access when user is signed in and has role admin. Relies on Supabase RLS to enforce server-side. */
function AdminRoute({ children }: { children: ReactNode }) {
  const { user, profile, loading, refetchProfile } = useAuth()
  const [retried, setRetried] = useState(false)
  const [giveUp, setGiveUp] = useState(false)

  useEffect(() => {
    if (user && profile === null && !retried) {
      setRetried(true)
      refetchProfile()
    }
  }, [user, profile, retried, refetchProfile])

  useEffect(() => {
    if (user && profile === null) {
      const t = setTimeout(() => setGiveUp(true), 8000)
      return () => clearTimeout(t)
    }
    setGiveUp(false)
  }, [user, profile])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-lavender-200 border-t-lavender-600 animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }
  if (!user) return <Navigate to="/" replace />
  if (profile === null && !giveUp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-lavender-200 border-t-lavender-600 animate-spin" />
          <p className="text-sm text-gray-500">Loading profile...</p>
        </div>
      </div>
    )
  }
  if (profile?.role !== 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}

const router = createBrowserRouter(
  [
    {
      element: <Outlet />,
      errorElement: <AppErrorBoundary />,
      children: [
        { path: '/', element: <HomePage /> },
        { path: '/privacy', element: <Suspense fallback={<LazyFallback />}><PrivacyPolicyPage /></Suspense> },
        { path: '/terms', element: <Suspense fallback={<LazyFallback />}><TermsOfServicePage /></Suspense> },
        { path: '/contact', element: <Suspense fallback={<LazyFallback />}><ContactPage /></Suspense> },
        { path: '/blog', element: <Suspense fallback={<LazyFallback />}><BlogListPage /></Suspense> },
        { path: '/blog/understanding-emotions-practical-ways-to-feel-better', element: <Navigate to="/blog/understanding-managing-emotions-guide" replace /> },
        { path: '/blog/:slug', element: <Suspense fallback={<LazyFallback />}><BlogPostPage /></Suspense> },
        { path: '/bookings', element: <Navigate to="/#get-help" replace /> },
        { path: '/my-bookings', element: <Suspense fallback={<LazyFallback />}><MyBookingsPage /></Suspense> },
        { path: '/profile', element: <Suspense fallback={<LazyFallback />}><ProfilePage /></Suspense> },
        { path: '/admin', element: <AdminRoute><Suspense fallback={<LazyFallback />}><AdminPage /></Suspense></AdminRoute> },
        { path: '/auth/google/callback', element: <AuthCallbackPage /> },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </AuthProvider>
  )
}

export default App
