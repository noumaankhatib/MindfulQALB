import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowLeft, Clock, Video, Headphones, MessageSquare, User, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import BookingFlow from '../components/BookingFlow';
import { useAuth } from '../contexts/AuthContext';
import { useGeolocation, formatPrice } from '../hooks/useGeolocation';

interface SessionOption {
  id: string;
  title: string;
  description: string;
  duration: number;
  priceINR: number;
  priceUSD: number;
  format: 'video' | 'audio' | 'chat';
  category: 'individual' | 'couples';
}

const sessionOptions: SessionOption[] = [
  {
    id: 'individual-video',
    title: 'Individual Video Session',
    description: 'Face-to-face video therapy for comprehensive support',
    duration: 50,
    priceINR: 1499,
    priceUSD: 18,
    format: 'video',
    category: 'individual',
  },
  {
    id: 'individual-audio',
    title: 'Individual Audio Session',
    description: 'Voice-based therapy for a personal touch',
    duration: 45,
    priceINR: 999,
    priceUSD: 12,
    format: 'audio',
    category: 'individual',
  },
  {
    id: 'individual-chat',
    title: 'Individual Chat Session',
    description: 'Text-based therapy for those who prefer typing',
    duration: 30,
    priceINR: 599,
    priceUSD: 7,
    format: 'chat',
    category: 'individual',
  },
  {
    id: 'couples-video',
    title: 'Couples Video Session',
    description: 'Joint video session for relationship support',
    duration: 60,
    priceINR: 2499,
    priceUSD: 30,
    format: 'video',
    category: 'couples',
  },
  {
    id: 'couples-audio',
    title: 'Couples Audio Session',
    description: 'Voice-based couples therapy',
    duration: 50,
    priceINR: 1799,
    priceUSD: 22,
    format: 'audio',
    category: 'couples',
  },
];

const BookingsPage = () => {
  const { user, profile } = useAuth();
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionOption | null>(null);
  const { isIndia } = useGeolocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBookSession = (session: SessionOption) => {
    setSelectedSession(session);
    setShowBookingFlow(true);
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'video': return Video;
      case 'audio': return Headphones;
      case 'chat': return MessageSquare;
      default: return Video;
    }
  };

  const individualSessions = sessionOptions.filter(s => s.category === 'individual');
  const couplesSessions = sessionOptions.filter(s => s.category === 'couples');

  const sessionCategories = [
    {
      title: 'Individual Therapy',
      description: 'One-on-one sessions tailored to your personal journey',
      sessions: individualSessions,
      icon: User,
      color: 'lavender',
    },
    {
      title: 'Couples Therapy',
      description: 'Strengthen your relationship with professional guidance',
      sessions: couplesSessions,
      icon: Users,
      color: 'rose',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-lavender-50/50 to-white">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="container-custom">
          {/* Header */}
          <div className="mb-12">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-lavender-600 hover:text-lavender-700 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Book a Session
              </h1>
              {user && profile && (
                <>
                  <p className="text-lg text-gray-600">
                    Welcome back, {profile.full_name || user.email}. Ready to continue your journey?
                  </p>
                  <Link
                    to="/my-bookings"
                    className="inline-flex items-center gap-2 mt-3 text-lavender-600 hover:text-lavender-700 font-medium"
                  >
                    View my bookings
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </>
              )}
              {!user && (
                <p className="text-lg text-gray-600">
                  Choose the type of therapy that best fits your needs.
                </p>
              )}
            </motion.div>
          </div>

          {/* Free Consultation Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-12 bg-gradient-to-r from-lavender-500 to-purple-600 rounded-2xl p-6 md:p-8 text-white shadow-xl"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-4">
                  <Calendar className="w-4 h-4" />
                  Free 15-minute call
                </div>
                <h2 className="text-2xl font-bold mb-2">Not sure where to start?</h2>
                <p className="text-lavender-100 max-w-lg">
                  Book a free consultation to discuss your needs and find the right approach for you. No commitment required.
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedSession({
                    id: 'free-consultation',
                    title: 'Free Consultation',
                    description: 'A brief introductory call',
                    format: 'video',
                    duration: 15,
                    priceINR: 0,
                    priceUSD: 0,
                    category: 'individual',
                  });
                  setShowBookingFlow(true);
                }}
                className="flex-shrink-0 px-6 py-3 bg-white text-lavender-600 rounded-xl font-semibold hover:bg-lavender-50 transition-colors shadow-lg"
              >
                Book Free Consultation
              </button>
            </div>
          </motion.div>

          {/* Session Categories */}
          <div className="space-y-12">
            {sessionCategories.map((category, categoryIndex) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + categoryIndex * 0.1 }}
              >
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${category.color === 'lavender' ? 'bg-lavender-100 text-lavender-600' : 'bg-rose-100 text-rose-600'}`}>
                      <category.icon className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{category.title}</h2>
                  </div>
                  <p className="text-gray-600 ml-12">{category.description}</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.sessions.map((session) => {
                    const price = isIndia ? session.priceINR : session.priceUSD;
                    const FormatIcon = getFormatIcon(session.format);

                    return (
                      <div
                        key={session.id}
                        className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg hover:border-lavender-200 transition-all cursor-pointer group"
                        onClick={() => handleBookSession(session)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-2 rounded-lg ${category.color === 'lavender' ? 'bg-lavender-50 text-lavender-600' : 'bg-rose-50 text-rose-600'} group-hover:scale-110 transition-transform`}>
                            <FormatIcon className="w-5 h-5" />
                          </div>
                          <span className="text-lg font-bold text-gray-900">
                            {formatPrice(price, isIndia)}
                          </span>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-1">{session.title}</h3>
                        <p className="text-sm text-gray-500 mb-3">{session.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {session.duration} min
                          </span>
                          <span className="capitalize">{session.format}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 bg-gray-50 rounded-2xl p-6 md:p-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What to expect</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="w-8 h-8 bg-lavender-100 text-lavender-600 rounded-full flex items-center justify-center font-bold mb-3">1</div>
                <h4 className="font-medium text-gray-900 mb-1">Choose your session</h4>
                <p className="text-sm text-gray-600">Select the type of therapy and format that works best for you.</p>
              </div>
              <div>
                <div className="w-8 h-8 bg-lavender-100 text-lavender-600 rounded-full flex items-center justify-center font-bold mb-3">2</div>
                <h4 className="font-medium text-gray-900 mb-1">Pick a time</h4>
                <p className="text-sm text-gray-600">Choose from available slots that fit your schedule.</p>
              </div>
              <div>
                <div className="w-8 h-8 bg-lavender-100 text-lavender-600 rounded-full flex items-center justify-center font-bold mb-3">3</div>
                <h4 className="font-medium text-gray-900 mb-1">Complete booking</h4>
                <p className="text-sm text-gray-600">Review consent, make payment, and receive confirmation.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />

      {/* Booking Flow Modal */}
      {showBookingFlow && selectedSession && (
        <BookingFlow
          session={{
            id: selectedSession.id,
            title: selectedSession.title,
            description: selectedSession.description,
            duration: String(selectedSession.duration),
            priceINR: selectedSession.priceINR,
            priceUSD: selectedSession.priceUSD,
            format: selectedSession.format,
            features: [],
          }}
          isOpen={showBookingFlow}
          onClose={() => {
            setShowBookingFlow(false);
            setSelectedSession(null);
          }}
        />
      )}
    </div>
  );
};

export default BookingsPage;
