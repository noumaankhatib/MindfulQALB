import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, RotateCcw, ChevronRight, Clock, CheckCircle, ExternalLink, ArrowRight } from 'lucide-react';
import { chatbotFlow, ChatStep, SessionRecommendation, getStepNumber, getTotalSteps, QuickLink } from '../data/chatbotFlow';
import { useGeolocation, formatPrice } from '../hooks/useGeolocation';
import BookingFlow from './BookingFlow';

interface ConversationMessage {
  id: string;
  type: 'bot' | 'user';
  content: string;
  step?: ChatStep;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepId, setCurrentStepId] = useState('start');
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionRecommendation | null>(null);
  const [hasCompletedFlow, setHasCompletedFlow] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isIndia } = useGeolocation();

  // Check if user has completed the flow before (session-based)
  useEffect(() => {
    try {
      const completed = sessionStorage.getItem('mq_chatbotCompleted');
      if (completed) {
        setHasCompletedFlow(true);
      }
    } catch {
      // Storage not available
    }
  }, []);

  // Initialize conversation with first message
  useEffect(() => {
    if (isOpen && conversation.length === 0) {
      const startStep = chatbotFlow.start;
      setConversation([
        {
          id: 'msg-0',
          type: 'bot',
          content: startStep.message,
          step: startStep,
        },
      ]);
    }
  }, [isOpen, conversation.length]);

  // Scroll to bottom when new messages appear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, isTyping]);

  // Smooth scroll to section
  const scrollToSection = useCallback((href: string) => {
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    
    if (element) {
      setIsOpen(false); // Close chatbot
      
      setTimeout(() => {
        const navHeight = 80;
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - navHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }, 300); // Wait for chatbot close animation
    }
  }, []);

  const handleOptionSelect = (optionLabel: string, nextStepId?: string, internalLink?: string) => {
    // Handle internal link navigation
    if (internalLink) {
      scrollToSection(internalLink);
      return;
    }

    // Add user's response
    const userMessage: ConversationMessage = {
      id: `msg-${conversation.length}`,
      type: 'user',
      content: optionLabel,
    };

    setConversation((prev) => [...prev, userMessage]);
    setIsTyping(true);

    if (nextStepId) {
      // Add bot's next message after a short delay (simulating typing)
      setTimeout(() => {
        const nextStep = chatbotFlow[nextStepId];
        if (nextStep) {
          setCurrentStepId(nextStepId);
          const botMessage: ConversationMessage = {
            id: `msg-${conversation.length + 1}`,
            type: 'bot',
            content: nextStep.message,
            step: nextStep,
          };
          setConversation((prev) => [...prev, botMessage]);
          setIsTyping(false);

          // Mark as completed if we reached a recommendation
          if (nextStep.type === 'recommendation') {
            try {
              sessionStorage.setItem('mq_chatbotCompleted', 'true');
            } catch {
              // Storage not available
            }
            setHasCompletedFlow(true);
          }
        }
      }, 800);
    } else {
      setIsTyping(false);
    }
  };

  const handleBookNow = (recommendation: SessionRecommendation) => {
    setSelectedSession(recommendation);
    setShowBookingFlow(true);
  };

  const handleStartOver = () => {
    setCurrentStepId('start');
    const startStep = chatbotFlow.start;
    setConversation([
      {
        id: 'msg-0',
        type: 'bot',
        content: startStep.message,
        step: startStep,
      },
    ]);
  };

  const handleQuickLink = (link: QuickLink) => {
    scrollToSection(link.href);
  };

  const currentStep = chatbotFlow[currentStepId];
  const stepNumber = getStepNumber(currentStepId);
  const totalSteps = getTotalSteps();

  // Format message with line breaks
  const formatMessage = (message: string) => {
    return message.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < message.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-lavender-500 to-lavender-600 text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center ${
          isOpen ? 'hidden' : ''
        }`}
        aria-label="Open chat assistant"
      >
        <MessageCircle className="w-6 h-6" />
        {!hasCompletedFlow && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full animate-pulse" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[560px] max-h-[calc(100vh-100px)] bg-white rounded-2xl shadow-2xl border border-lavender-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-lavender-500 to-lavender-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">MindfulQalb Assistant</h3>
                  <p className="text-xs text-white/80">Here to guide you</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleStartOver}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Start over"
                  title="Start over"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="px-4 py-2 bg-lavender-50 border-b border-lavender-100">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Step {stepNumber} of {totalSteps}</span>
                <span>{Math.round((stepNumber / totalSteps) * 100)}% complete</span>
              </div>
              <div className="h-1.5 bg-lavender-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(stepNumber / totalSteps) * 100}%` }}
                  className="h-full bg-gradient-to-r from-lavender-400 to-lavender-500 rounded-full"
                />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversation.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-lavender-500 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{formatMessage(message.content)}</p>

                    {/* Quick Links for info/quick_links type */}
                    {message.step?.type === 'quick_links' && message.step.quickLinks && (
                      <div className="mt-3 space-y-2">
                        {message.step.quickLinks.map((link, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuickLink(link)}
                            className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-lavender-100 hover:border-lavender-300 hover:bg-lavender-50 transition-all group text-left"
                          >
                            <div>
                              <span className="block font-medium text-sm text-gray-800 group-hover:text-lavender-700">
                                {link.label}
                              </span>
                              <span className="block text-xs text-gray-500">{link.description}</span>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-lavender-600" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Recommendation Card */}
                    {message.step?.type === 'recommendation' && message.step.recommendation && (
                      <div className="mt-3 p-4 bg-white rounded-xl border border-lavender-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-800">
                            {message.step.recommendation.title}
                          </h4>
                          <span className="text-lg font-bold text-lavender-600">
                            {formatPrice(
                              message.step.recommendation.priceINR,
                              message.step.recommendation.priceUSD,
                              isIndia
                            )}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{message.step.recommendation.duration}</span>
                        </div>

                        <ul className="space-y-1.5 mb-4">
                          {message.step.recommendation.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                              <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <button
                          onClick={() => handleBookNow(message.step!.recommendation!)}
                          className="w-full py-2.5 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white text-sm font-medium rounded-lg hover:from-lavender-600 hover:to-lavender-700 transition-all flex items-center justify-center gap-2"
                        >
                          Book Session
                          <ArrowRight className="w-4 h-4" />
                        </button>

                        {/* Additional helpful links */}
                        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-center gap-4">
                          <button
                            onClick={() => scrollToSection('#approach')}
                            className="text-xs text-lavender-600 hover:text-lavender-800 hover:underline"
                          >
                            My Approach
                          </button>
                          <button
                            onClick={() => scrollToSection('#faq')}
                            className="text-xs text-lavender-600 hover:text-lavender-800 hover:underline"
                          >
                            FAQs
                          </button>
                          <button
                            onClick={() => scrollToSection('#about')}
                            className="text-xs text-lavender-600 hover:text-lavender-800 hover:underline"
                          >
                            About Me
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Options for current step */}
              {!isTyping && currentStep?.options && (currentStep.type === 'question' || currentStep.type === 'info' || currentStep.type === 'quick_links') && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-2 justify-start"
                >
                  {currentStep.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleOptionSelect(option.label, option.nextStepId, option.internalLink)}
                      className={`px-4 py-2.5 text-sm rounded-full transition-all ${
                        option.internalLink
                          ? 'bg-lavender-50 border border-lavender-200 text-lavender-700 hover:bg-lavender-100 flex items-center gap-1.5'
                          : 'bg-white border border-lavender-200 text-lavender-700 hover:bg-lavender-50 hover:border-lavender-300'
                      }`}
                    >
                      {option.label}
                      {option.internalLink && <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Need help?{' '}
                  <button 
                    onClick={() => scrollToSection('#get-help')} 
                    className="text-lavender-600 hover:underline"
                  >
                    Contact directly
                  </button>
                </p>
                <button
                  onClick={() => scrollToSection('#get-help')}
                  className="text-xs px-3 py-1.5 bg-lavender-100 text-lavender-700 rounded-full hover:bg-lavender-200 transition-colors"
                >
                  Book Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Flow Modal */}
      {showBookingFlow && selectedSession && (
        <BookingFlow
          session={selectedSession}
          isOpen={showBookingFlow}
          onClose={() => {
            setShowBookingFlow(false);
            setSelectedSession(null);
          }}
        />
      )}
    </>
  );
};

export default Chatbot;
