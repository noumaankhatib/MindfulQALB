import { useEffect, useState, lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, RouterProvider, Navigate, useLocation, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AppErrorBoundary, NotFoundPage } from './components/AppErrorBoundary'
import { Outlet } from 'react-router-dom'
import { cleanupLegacyStorage } from './utils/secureStorage'
import Navigation from './components/Navigation'
import Hero from './components/Hero'
import WhoWeHelp from './components/WhoWeHelp'
import WhatWeOffer from './components/WhatWeOffer'
import TrustSignals from './components/TrustSignals'
import QuickAccess from './components/QuickAccess'
import MentalHealth from './components/MentalHealth'
import CouplesRelationships from './components/CouplesRelationships'
import FamilyCounseling from './components/FamilyCounseling'
import HolisticWellness from './components/HolisticWellness'
import SelfHelpTools from './components/SelfHelpTools'
import SupportGroups from './components/SupportGroups'
import AboutTherapist from './components/AboutTherapist'
import TherapeuticApproach from './components/TherapeuticApproach'
import Programs from './components/Programs'
import GetHelp from './components/GetHelp'
import AboutEthics from './components/AboutEthics'
import Footer from './components/Footer'
import FAQ from './components/FAQ'
import Chatbot from './components/Chatbot'

const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'))
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'))
const MyBookingsPage = lazy(() => import('./pages/MyBookingsPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))

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

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "What types of therapy do you offer?", "acceptedAnswer": { "@type": "Answer", "text": "I offer individual therapy, couples therapy, support groups, and self-help tools. All services are evidence-based and provided by a licensed psychologist." } },
    { "@type": "Question", "name": "Is online therapy effective?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, research shows that online therapy can be as effective as in-person therapy for many conditions. I use secure, compliant platforms to ensure privacy and confidentiality." } },
    { "@type": "Question", "name": "How do I get started?", "acceptedAnswer": { "@type": "Answer", "text": "You can book a session directly through the calendar on my website. I offer a free initial consultation to understand your needs and see if we're a good fit." } },
    { "@type": "Question", "name": "What is your approach to couples therapy?", "acceptedAnswer": { "@type": "Answer", "text": "I use evidence-based approaches including EFT (Emotionally Focused Therapy), Gottman Method, and trauma-informed care. I am trained to work with all relationship types and orientations." } },
    { "@type": "Question", "name": "Is my information confidential?", "acceptedAnswer": { "@type": "Answer", "text": "Absolutely. I use secure platforms and strict confidentiality protocols. Your privacy is my top priority." } },
  ]
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
        <meta name="description" content="Online therapy and counseling by a licensed psychologist. Individual therapy, couples therapy, and support groups. Book a free 15-minute consultation today." />
        <link rel="canonical" href="https://mindfulqalb.com/" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Mindful QALB | Evidence-Based Mental Health Care" />
        <meta property="og:description" content="Online therapy and counseling by a licensed psychologist. Individual therapy, couples therapy, and support groups." />
        <meta property="og:url" content="https://mindfulqalb.com/" />
        <meta property="og:image" content="https://mindfulqalb.com/og-image.png" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      {/* Skip to content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-lavender-600 focus:text-white focus:rounded-lg focus:outline-none"
      >
        Skip to main content
      </a>
      
      <Navigation />
      <main id="main-content">
        <Hero />
        <AboutTherapist />
        <TherapeuticApproach />
        <WhoWeHelp />
        <WhatWeOffer />
        <TrustSignals />
        <QuickAccess />
        <MentalHealth />
        <CouplesRelationships />
        {/* <TherapySupport /> */}
        <FamilyCounseling />
        <HolisticWellness />
        <SelfHelpTools />
        <SupportGroups />
        <Programs />
        <GetHelp />
        <AboutEthics />
        <FAQ />
      </main>
      <Footer />
      
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
