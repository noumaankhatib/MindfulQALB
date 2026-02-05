// Consent form data for therapy services
// Based on standard therapeutic practice and compliance requirements

export interface ConsentSection {
  id: string;
  title: string;
  content: string;
  required: boolean;
}

export interface ConsentFormData {
  title: string;
  introduction: string;
  sections: ConsentSection[];
  acknowledgments: string[];
  lastUpdated: string;
}

export const consentFormData: ConsentFormData = {
  title: 'Informed Consent for Psychological Services',
  introduction: `Welcome to MindfulQalb. Before we begin our therapeutic journey together, please read and acknowledge the following information about our services, policies, and your rights as a client.`,
  lastUpdated: '2024-01-15',
  
  sections: [
    {
      id: 'services',
      title: 'Nature of Services',
      content: `I understand that I am seeking psychological counseling/therapy services from a qualified mental health professional. Therapy is a collaborative process between the therapist and client, designed to help explore feelings, beliefs, behaviors, and work toward personal growth and healing.

The therapeutic approach may include but is not limited to: talk therapy, cognitive-behavioral techniques, mindfulness practices, emotional processing, and evidence-based interventions tailored to my needs.`,
      required: true,
    },
    {
      id: 'confidentiality',
      title: 'Confidentiality & Privacy',
      content: `I understand that all information shared during sessions is strictly confidential and will not be disclosed to any third party without my written consent, except in the following circumstances as required by law:

• If there is risk of harm to myself or others
• If there is suspected abuse or neglect of a child, elderly, or dependent adult
• If records are subpoenaed by a court of law
• If I provide written authorization for release

All session notes and personal information are stored securely and handled in compliance with applicable privacy laws.`,
      required: true,
    },
    {
      id: 'online-services',
      title: 'Online/Telehealth Services',
      content: `I understand that services may be provided via secure video/audio platforms. I acknowledge:

• I will ensure a private, quiet space for sessions
• I am responsible for having reliable internet connectivity
• Technical difficulties may occasionally occur
• I will not record sessions without explicit written consent
• Emergency protocols may differ for remote sessions`,
      required: true,
    },
    {
      id: 'fees-payment',
      title: 'Fees & Payment Policy',
      content: `I understand and agree to the following payment terms:

• Session fees are as displayed at the time of booking
• Payment is required at the time of booking to confirm the appointment
• Rescheduling is available with minimum 24-hour notice
• Cancellations with less than 24-hour notice may incur a cancellation fee
• No-shows may be charged the full session fee
• Refunds are processed according to the cancellation policy`,
      required: true,
    },
    {
      id: 'risks-benefits',
      title: 'Risks & Benefits',
      content: `I understand that therapy has both potential benefits and risks:

Benefits may include: improved relationships, better coping skills, reduced symptoms of distress, increased self-awareness, and enhanced quality of life.

Risks may include: temporary discomfort when discussing difficult topics, recall of unpleasant memories, and changes in relationships as personal growth occurs.

I understand that outcomes cannot be guaranteed and that my active participation is essential for progress.`,
      required: true,
    },
    {
      id: 'rights',
      title: 'Client Rights',
      content: `As a client, I have the right to:

• Ask questions about the therapeutic process at any time
• Discuss the treatment approach and any concerns
• Terminate therapy at any time
• Request a referral to another professional
• Access my records as permitted by law
• A safe, respectful, and non-judgmental therapeutic environment
• Provide feedback about the services received`,
      required: true,
    },
    {
      id: 'emergency',
      title: 'Emergency Procedures',
      content: `I understand that therapy sessions are not a substitute for emergency services. In case of a mental health emergency:

• I will contact emergency services (112 in India)
• I will contact a crisis helpline (iCall: 9152987821, Vandrevala: 1860-2662-345)
• I will go to the nearest emergency room if needed

I understand that the therapist may not be available outside of scheduled sessions and I should use emergency resources when needed.`,
      required: true,
    },
  ],
  
  acknowledgments: [
    'I have read and understood all the information provided above',
    'I have had the opportunity to ask questions and have them answered',
    'I consent to receive psychological services as described',
    'I understand the confidentiality policies and their limitations',
    'I agree to the payment and cancellation policies',
    'I am providing this consent voluntarily',
  ],
};

// Helper to generate consent record for compliance tracking
export interface ConsentRecord {
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  sessionType: string;
  consentVersion: string;
  acknowledgments: string[];
  signature: string; // Client's typed name as electronic signature
  email: string;
}

export const createConsentRecord = (
  sessionType: string,
  signature: string,
  email: string,
  acknowledgments: string[]
): ConsentRecord => ({
  timestamp: new Date().toISOString(),
  userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  sessionType,
  consentVersion: consentFormData.lastUpdated,
  acknowledgments,
  signature,
  email,
});

export default consentFormData;
