// Chatbot decision tree data for guided session recommendations
// Based on the fee structure:
// - Chat Session: 45 min - INR 500
// - Audio Consultation: 50 min - INR 800
// - Video Consultation: 60 min - INR 1,200
// - Couple Therapy: 90 min - INR 1,999

export interface ChatOption {
  id: string;
  label: string;
  nextStepId?: string;
  recommendation?: SessionRecommendation;
}

export interface ChatStep {
  id: string;
  type: 'question' | 'recommendation';
  message: string;
  options?: ChatOption[];
  recommendation?: SessionRecommendation;
}

export interface SessionRecommendation {
  id: string;
  title: string;
  duration: string;
  priceINR: number;
  priceUSD: number;
  description: string;
  features: string[];
}

// Session types with pricing
export const sessionTypes: Record<string, SessionRecommendation> = {
  chat: {
    id: 'chat',
    title: 'Chat Session',
    duration: '45 min',
    priceINR: 500,
    priceUSD: 6,
    description: 'Text-based therapy session for those who prefer typing',
    features: [
      'Comfortable text-based communication',
      'Great for first-time therapy seekers',
      'No video or audio required',
      'Review conversation anytime',
    ],
  },
  audio: {
    id: 'audio',
    title: 'Audio Consultation',
    duration: '50 min',
    priceINR: 800,
    priceUSD: 10,
    description: 'Voice-based therapy session for a more personal touch',
    features: [
      'Real-time voice conversation',
      'More personal than chat',
      'No need to show your face',
      'Convenient and private',
    ],
  },
  video: {
    id: 'video',
    title: 'Video Consultation',
    duration: '60 min',
    priceINR: 1200,
    priceUSD: 15,
    description: 'Face-to-face video therapy session for comprehensive support',
    features: [
      'Full video consultation',
      'Most personal connection',
      'Visual cues enhance therapy',
      'Like being in the same room',
    ],
  },
  couple: {
    id: 'couple',
    title: 'Couple Therapy',
    duration: '90 min',
    priceINR: 1999,
    priceUSD: 24,
    description: 'Extended session for couples to work through relationship challenges',
    features: [
      'Extended 90-minute session',
      'Both partners participate',
      'Relationship-focused therapy',
      'Evidence-based techniques',
    ],
  },
};

// Chatbot conversation flow
export const chatbotFlow: Record<string, ChatStep> = {
  start: {
    id: 'start',
    type: 'question',
    message: "Hi! I'm here to help you find the right support. What brings you here today?",
    options: [
      { id: 'stress', label: 'Stress or Anxiety', nextStepId: 'experience' },
      { id: 'relationship', label: 'Relationship Issues', nextStepId: 'experience' },
      { id: 'growth', label: 'Personal Growth', nextStepId: 'experience' },
      { id: 'exploring', label: 'Just Exploring', nextStepId: 'experience' },
    ],
  },
  experience: {
    id: 'experience',
    type: 'question',
    message: 'Thank you for sharing. Have you tried therapy before?',
    options: [
      { id: 'yes', label: 'Yes, I have some experience', nextStepId: 'preference' },
      { id: 'no', label: "No, this is my first time", nextStepId: 'preference' },
    ],
  },
  preference: {
    id: 'preference',
    type: 'question',
    message: 'Great! How would you prefer to communicate during sessions?',
    options: [
      { id: 'chat', label: '💬 Text/Chat', nextStepId: 'recommend_chat' },
      { id: 'audio', label: '📞 Voice Call', nextStepId: 'recommend_audio' },
      { id: 'video', label: '📹 Video Call', nextStepId: 'session_type' },
    ],
  },
  session_type: {
    id: 'session_type',
    type: 'question',
    message: 'Are you looking for an individual session or a session with your partner?',
    options: [
      { id: 'individual', label: 'Individual Session', nextStepId: 'recommend_video' },
      { id: 'couple', label: 'Couples/Partner Session', nextStepId: 'recommend_couple' },
    ],
  },
  recommend_chat: {
    id: 'recommend_chat',
    type: 'recommendation',
    message: 'Based on your preferences, I recommend our Chat Session:',
    recommendation: sessionTypes.chat,
  },
  recommend_audio: {
    id: 'recommend_audio',
    type: 'recommendation',
    message: 'Based on your preferences, I recommend our Audio Consultation:',
    recommendation: sessionTypes.audio,
  },
  recommend_video: {
    id: 'recommend_video',
    type: 'recommendation',
    message: 'Based on your preferences, I recommend our Video Consultation:',
    recommendation: sessionTypes.video,
  },
  recommend_couple: {
    id: 'recommend_couple',
    type: 'recommendation',
    message: "Great choice! For couples, I recommend our Couple Therapy session:",
    recommendation: sessionTypes.couple,
  },
};

// Helper to get the total number of steps (for progress indicator)
export const getTotalSteps = (): number => {
  // Start -> Experience -> Preference -> (Session Type for video) -> Recommendation
  // Maximum path has 4 questions
  return 4;
};

// Helper to get current step number based on step id
export const getStepNumber = (stepId: string): number => {
  const stepOrder: Record<string, number> = {
    start: 1,
    experience: 2,
    preference: 3,
    session_type: 4,
    recommend_chat: 4,
    recommend_audio: 4,
    recommend_video: 5,
    recommend_couple: 5,
  };
  return stepOrder[stepId] || 1;
};

export default chatbotFlow;
