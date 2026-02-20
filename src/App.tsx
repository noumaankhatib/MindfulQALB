import { useEffect } from 'react'
import { createBrowserRouter, RouterProvider, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
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
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfServicePage from './pages/TermsOfServicePage'
import MyBookingsPage from './pages/MyBookingsPage'
import AdminPage from './pages/AdminPage'

// Home page component
const HomePage = () => {
  const location = useLocation()

  useEffect(() => {
    if (location.hash === '#get-help') {
      const el = document.getElementById('get-help')
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
      }
    }
  }, [location.hash])

  useEffect(() => {
    // Clean up any legacy localStorage data that contained PII
    cleanupLegacyStorage();
    
    // Add FAQ schema for SEO
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What types of therapy do you offer?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "I offer individual therapy, couples therapy, support groups, and self-help tools. All services are evidence-based and provided by a licensed psychologist."
          }
        },
        {
          "@type": "Question",
          "name": "Is online therapy effective?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, research shows that online therapy can be as effective as in-person therapy for many conditions. I use secure, compliant platforms to ensure privacy and confidentiality."
          }
        },
        {
          "@type": "Question",
          "name": "How do I get started?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You can book a session directly through the calendar on my website. I offer a free initial consultation to understand your needs and see if we're a good fit."
          }
        },
        {
          "@type": "Question",
          "name": "What is your approach to couples therapy?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "I use evidence-based approaches including EFT (Emotionally Focused Therapy), Gottman Method, and trauma-informed care. I am trained to work with all relationship types and orientations."
          }
        },
        {
          "@type": "Question",
          "name": "Is my information confidential?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Absolutely. I use secure platforms and strict confidentiality protocols. Your privacy is my top priority."
          }
        }
      ]
    }

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(faqSchema)
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  return (
    <div className="min-h-screen relative overflow-x-hidden">
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
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/" replace />
  if (profile?.role !== 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/privacy', element: <PrivacyPolicyPage /> },
  { path: '/terms', element: <TermsOfServicePage /> },
  { path: '/bookings', element: <Navigate to="/#get-help" replace /> },
  { path: '/my-bookings', element: <MyBookingsPage /> },
  { path: '/admin', element: <AdminRoute><AdminPage /></AdminRoute> },
])

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
