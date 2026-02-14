// Enhanced chatbot decision tree - Context-aware with website content integration
// Structured therapy-related questions with service suggestions and internal links

export interface ChatOption {
  id: string;
  label: string;
  nextStepId?: string;
  recommendation?: SessionRecommendation;
  internalLink?: string; // Link to website section
}

export interface ChatStep {
  id: string;
  type: 'question' | 'recommendation' | 'info' | 'quick_links';
  message: string;
  options?: ChatOption[];
  recommendation?: SessionRecommendation;
  quickLinks?: QuickLink[];
}

export interface QuickLink {
  label: string;
  href: string;
  description: string;
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
    duration: '30 min',
    priceINR: 499,
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
    duration: '45 min',
    priceINR: 899,
    priceUSD: 11,
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
    priceINR: 1299,
    priceUSD: 16,
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

// Website sections for context-aware responses
export const websiteSections = {
  approach: { href: '#approach', label: 'My Therapeutic Approach' },
  mentalHealth: { href: '#mental-health', label: 'Mental Health Support' },
  couples: { href: '#couples', label: 'Couples & Relationships' },
  family: { href: '#family', label: 'Family Counseling' },
  selfHelp: { href: '#self-help', label: 'Self-Help Tools' },
  about: { href: '#about', label: 'About Aqsa Khatib' },
  booking: { href: '#get-help', label: 'Book a Session' },
  faq: { href: '#faq', label: 'FAQs' },
};

// Enhanced chatbot conversation flow with context awareness
export const chatbotFlow: Record<string, ChatStep> = {
  // Welcome - Warm, therapy-appropriate greeting
  start: {
    id: 'start',
    type: 'question',
    message: "Hello, and welcome. 💜 I'm here to help you find the right support. Taking this step shows real strength. How can I help you today?",
    options: [
      { id: 'struggling', label: "I'm struggling and need support", nextStepId: 'whats_happening' },
      { id: 'relationship', label: 'Relationship or couples help', nextStepId: 'relationship_type' },
      { id: 'learn', label: 'Learn about services', nextStepId: 'services_overview' },
      { id: 'booking', label: 'Book a session directly', nextStepId: 'booking_preference' },
    ],
  },

  // Branch 1: Individual Support - Deeper assessment
  whats_happening: {
    id: 'whats_happening',
    type: 'question',
    message: "I'm here to listen. Can you share a bit about what you're experiencing? This helps me guide you to the right support.",
    options: [
      { id: 'anxiety', label: 'Anxiety, stress, or overwhelm', nextStepId: 'anxiety_followup' },
      { id: 'depression', label: 'Feeling low, sad, or hopeless', nextStepId: 'depression_followup' },
      { id: 'trauma', label: 'Past trauma or difficult memories', nextStepId: 'trauma_followup' },
      { id: 'life', label: 'Life changes or transitions', nextStepId: 'life_followup' },
      { id: 'other', label: 'Something else', nextStepId: 'general_support' },
    ],
  },

  // Anxiety path
  anxiety_followup: {
    id: 'anxiety_followup',
    type: 'question',
    message: "Living with anxiety can be exhausting. I use evidence-based approaches like CBT and mindfulness that have helped many people find calm. How long have you been feeling this way?",
    options: [
      { id: 'recent', label: 'Recently started', nextStepId: 'therapy_experience' },
      { id: 'months', label: 'Several months', nextStepId: 'therapy_experience' },
      { id: 'years', label: 'For a long time', nextStepId: 'therapy_experience' },
    ],
  },

  // Depression path
  depression_followup: {
    id: 'depression_followup',
    type: 'question',
    message: "Thank you for sharing that. It takes courage to acknowledge these feelings. Depression is treatable, and you don't have to face it alone. Are you currently in crisis or having thoughts of self-harm?",
    options: [
      { id: 'no_crisis', label: "No, I'm safe right now", nextStepId: 'therapy_experience' },
      { id: 'crisis', label: 'Yes, I need immediate help', nextStepId: 'crisis_resources' },
    ],
  },

  // Crisis resources
  crisis_resources: {
    id: 'crisis_resources',
    type: 'info',
    message: "Your safety is the priority. Please reach out to one of these crisis helplines immediately:\n\n📞 iCall (TISS): 9152987821\n📞 Vandrevala Foundation: 1860-2662-345 (24/7)\n📞 Emergency: 112\n\nOnce you're safe, I'm here to help you find ongoing support.",
    options: [
      { id: 'safe_now', label: "I'm safe now, continue", nextStepId: 'therapy_experience' },
      { id: 'more_resources', label: 'Show more resources', internalLink: '#get-help' },
    ],
  },

  // Trauma path
  trauma_followup: {
    id: 'trauma_followup',
    type: 'question',
    message: "Healing from trauma is possible. I'm trained in trauma-informed approaches that prioritize your safety and pace. Would you like to learn about how I work with trauma?",
    options: [
      { id: 'yes_approach', label: 'Yes, tell me more', nextStepId: 'trauma_approach' },
      { id: 'ready_book', label: "I'm ready to book", nextStepId: 'booking_preference' },
    ],
  },

  trauma_approach: {
    id: 'trauma_approach',
    type: 'info',
    message: "I use gentle, evidence-based methods including:\n\n• Trauma-informed CBT\n• EMDR (Eye Movement Desensitization)\n• Somatic awareness\n• Gradual, safe processing\n\nWe'll always go at your pace. You're in control of the process.",
    options: [
      { id: 'see_approach', label: 'View my full approach', internalLink: '#approach' },
      { id: 'book_trauma', label: 'Book a session', nextStepId: 'booking_preference' },
    ],
  },

  // Life transitions
  life_followup: {
    id: 'life_followup',
    type: 'question',
    message: "Life transitions—even positive ones—can be challenging. What kind of change are you navigating?",
    options: [
      { id: 'career', label: 'Career or work changes', nextStepId: 'therapy_experience' },
      { id: 'relationship_change', label: 'Relationship changes', nextStepId: 'relationship_type' },
      { id: 'loss', label: 'Loss or grief', nextStepId: 'therapy_experience' },
      { id: 'identity', label: 'Personal identity or growth', nextStepId: 'therapy_experience' },
    ],
  },

  // General support
  general_support: {
    id: 'general_support',
    type: 'question',
    message: "Whatever you're facing, therapy can help. Sometimes it's hard to put into words—and that's okay. Would you prefer to explore my services or talk to me directly?",
    options: [
      { id: 'explore', label: 'Explore services', nextStepId: 'services_overview' },
      { id: 'book_call', label: 'Book a consultation', nextStepId: 'booking_preference' },
    ],
  },

  // Branch 2: Relationship Support
  relationship_type: {
    id: 'relationship_type',
    type: 'question',
    message: "Relationships are at the heart of our wellbeing. What type of relationship support are you looking for?",
    options: [
      { id: 'romantic', label: 'Romantic partner / marriage', nextStepId: 'couples_issues' },
      { id: 'family_rel', label: 'Family relationships', nextStepId: 'family_issues' },
      { id: 'personal', label: 'My relationship patterns', nextStepId: 'therapy_experience' },
    ],
  },

  couples_issues: {
    id: 'couples_issues',
    type: 'question',
    message: "Every couple faces challenges. I use Gottman Method and Emotionally Focused Therapy (EFT)—proven approaches that help couples reconnect. What resonates most?",
    options: [
      { id: 'communication', label: 'Communication problems', nextStepId: 'recommend_couple' },
      { id: 'trust', label: 'Trust or infidelity', nextStepId: 'recommend_couple' },
      { id: 'disconnect', label: 'Feeling disconnected', nextStepId: 'recommend_couple' },
      { id: 'premarital', label: 'Pre-marital counseling', nextStepId: 'recommend_couple' },
    ],
  },

  family_issues: {
    id: 'family_issues',
    type: 'question',
    message: "Family dynamics can be complex. I help families improve communication and heal together. What's happening in your family?",
    options: [
      { id: 'parent_child', label: 'Parent-child conflicts', nextStepId: 'family_recommendation' },
      { id: 'teen', label: 'Teen/adolescent issues', nextStepId: 'family_recommendation' },
      { id: 'blended', label: 'Blended family challenges', nextStepId: 'family_recommendation' },
      { id: 'general_family', label: 'General family therapy', nextStepId: 'family_recommendation' },
    ],
  },

  family_recommendation: {
    id: 'family_recommendation',
    type: 'info',
    message: "Family therapy can transform relationships. Sessions typically include relevant family members and focus on improving communication and understanding.",
    quickLinks: [
      { label: 'Learn about Family Counseling', href: '#family', description: 'See our family therapy approach' },
      { label: 'Book Family Session', href: '#get-help', description: 'Schedule a family consultation' },
    ],
    options: [
      { id: 'learn_family', label: 'Learn more about family therapy', internalLink: '#family' },
      { id: 'book_family', label: 'Book a session', nextStepId: 'booking_preference' },
    ],
  },

  // Branch 3: Learn about services
  services_overview: {
    id: 'services_overview',
    type: 'quick_links',
    message: "I offer a range of evidence-based services. What would you like to explore?",
    quickLinks: [
      { label: 'Mental Health Support', href: '#mental-health', description: 'Anxiety, depression, trauma & more' },
      { label: 'Couples Therapy', href: '#couples', description: 'Strengthen your relationship' },
      { label: 'My Therapeutic Approach', href: '#approach', description: 'CBT, ACT, Gestalt & more' },
      { label: 'Self-Help Tools', href: '#self-help', description: 'Resources for your journey' },
    ],
    options: [
      { id: 'mental_health', label: 'Mental Health Support', internalLink: '#mental-health' },
      { id: 'couples_service', label: 'Couples Therapy', internalLink: '#couples' },
      { id: 'approach', label: 'My Approach', internalLink: '#approach' },
      { id: 'ready', label: "I'm ready to book", nextStepId: 'booking_preference' },
    ],
  },

  // Therapy experience assessment
  therapy_experience: {
    id: 'therapy_experience',
    type: 'question',
    message: "It helps me to know—have you worked with a therapist before?",
    options: [
      { id: 'yes_exp', label: 'Yes, I have experience', nextStepId: 'booking_preference' },
      { id: 'no_exp', label: "No, this is my first time", nextStepId: 'first_time_info' },
      { id: 'tried_not_worked', label: "Tried before, didn't work", nextStepId: 'different_approach' },
    ],
  },

  // First-time therapy seekers
  first_time_info: {
    id: 'first_time_info',
    type: 'info',
    message: "Taking the first step is often the hardest—and you've already done that by being here. 💜\n\nWhat to expect:\n• A safe, judgment-free space\n• We go at your pace\n• Everything stays confidential\n• I'll explain everything clearly\n\nMany clients wish they'd started sooner. Ready to begin?",
    options: [
      { id: 'see_faq', label: 'Read FAQs', internalLink: '#faq' },
      { id: 'book_first', label: 'Book my first session', nextStepId: 'booking_preference' },
      { id: 'about_me', label: 'Learn about Aqsa', internalLink: '#about' },
    ],
  },

  // For those who tried therapy before
  different_approach: {
    id: 'different_approach',
    type: 'info',
    message: "I understand. Not every therapist-client match works, and that's okay. My approach is warm, eclectic, and tailored to YOU—not one-size-fits-all.\n\nI integrate multiple evidence-based methods based on what will help you most.",
    options: [
      { id: 'see_approach', label: 'See my approach', internalLink: '#approach' },
      { id: 'try_again', label: 'Ready to try again', nextStepId: 'booking_preference' },
    ],
  },

  // Booking preferences
  booking_preference: {
    id: 'booking_preference',
    type: 'question',
    message: "Great! How would you prefer to connect during sessions?",
    options: [
      { id: 'chat_pref', label: '💬 Text/Chat (30 min)', nextStepId: 'recommend_chat' },
      { id: 'audio_pref', label: '📞 Voice Call (45 min)', nextStepId: 'recommend_audio' },
      { id: 'video_pref', label: '📹 Video Call (60 min)', nextStepId: 'session_for_who' },
    ],
  },

  session_for_who: {
    id: 'session_for_who',
    type: 'question',
    message: 'Is this session for yourself or with a partner?',
    options: [
      { id: 'just_me', label: 'Just for me', nextStepId: 'recommend_video' },
      { id: 'with_partner', label: 'With my partner', nextStepId: 'recommend_couple' },
    ],
  },

  // Recommendations
  recommend_chat: {
    id: 'recommend_chat',
    type: 'recommendation',
    message: 'Based on your preferences, our Chat Session would be perfect for you:',
    recommendation: sessionTypes.chat,
  },
  recommend_audio: {
    id: 'recommend_audio',
    type: 'recommendation',
    message: 'Based on your preferences, our Audio Consultation is a great fit:',
    recommendation: sessionTypes.audio,
  },
  recommend_video: {
    id: 'recommend_video',
    type: 'recommendation',
    message: 'Our Video Consultation offers the most personal connection:',
    recommendation: sessionTypes.video,
  },
  recommend_couple: {
    id: 'recommend_couple',
    type: 'recommendation',
    message: "For couples, I recommend our extended Couple Therapy session:",
    recommendation: sessionTypes.couple,
  },
};

// Helper to get the total number of steps (for progress indicator)
export const getTotalSteps = (): number => {
  return 5; // Adjusted for deeper conversation flow
};

// Helper to get current step number based on step id
export const getStepNumber = (stepId: string): number => {
  const stepOrder: Record<string, number> = {
    start: 1,
    whats_happening: 2,
    relationship_type: 2,
    services_overview: 2,
    booking_preference: 2,
    anxiety_followup: 3,
    depression_followup: 3,
    trauma_followup: 3,
    life_followup: 3,
    general_support: 3,
    couples_issues: 3,
    family_issues: 3,
    therapy_experience: 3,
    crisis_resources: 3,
    trauma_approach: 4,
    family_recommendation: 4,
    first_time_info: 4,
    different_approach: 4,
    session_for_who: 4,
    recommend_chat: 5,
    recommend_audio: 5,
    recommend_video: 5,
    recommend_couple: 5,
  };
  return stepOrder[stepId] || 1;
};

export default chatbotFlow;
