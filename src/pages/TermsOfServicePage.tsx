import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';

const TermsOfServicePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Terms of Service | MindfulQALB';
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Logo size="md" showText={true} />
            </Link>
            <Link 
              to="/"
              className="flex items-center gap-2 text-gray-600 hover:text-lavender-600 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <article className="prose prose-gray max-w-none">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-500 text-sm mb-8">Last updated: February 2026</p>
          
          <p className="text-gray-600 mb-8">
            Please read these Terms of Service carefully before using MindfulQALB's services. 
            By booking a session or using our platform, you agree to be bound by these terms.
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Services Provided</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>MindfulQALB provides online therapy and counseling services</li>
              <li>Services are provided by licensed mental health professionals</li>
              <li>Sessions are conducted via secure video, audio, or chat platforms</li>
              <li>Services are not a substitute for emergency mental health care</li>
              <li>We offer individual, couples, and family therapy sessions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Eligibility</h2>
            <p className="text-gray-600 mb-4">To use our services, you must:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Be at least 18 years of age (or have parental consent)</li>
              <li>Have the legal capacity to enter into this agreement</li>
              <li>Provide accurate and complete information</li>
              <li>Have access to a stable internet connection for online sessions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Client Responsibilities</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Provide accurate and complete information about yourself</li>
              <li>Attend scheduled sessions on time or provide 24-hour cancellation notice</li>
              <li>Maintain a private, safe space for conducting online sessions</li>
              <li>Inform the therapist immediately if experiencing a mental health emergency</li>
              <li>Respect the confidentiality of group sessions (if applicable)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Payment Terms</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Payment is due at the time of booking or as agreed upon</li>
              <li>Session fees are clearly displayed before booking</li>
              <li>We accept payments via Razorpay (India) and Stripe (International)</li>
              <li>All fees are quoted in the local currency based on your location</li>
              <li>Receipts are provided for all payments</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Cancellation & Refund Policy</h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li><strong>24+ hours notice:</strong> Full refund or reschedule at no charge</li>
                <li><strong>Less than 24 hours notice:</strong> 50% cancellation fee applies</li>
                <li><strong>No-show without notice:</strong> Full session fee charged</li>
                <li><strong>Emergency situations:</strong> Handled on a case-by-case basis</li>
              </ul>
            </div>
            <p className="text-gray-600 text-sm">
              To cancel or reschedule, please contact us at mindfulqalb@gmail.com
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Confidentiality</h2>
            <p className="text-gray-600 mb-4">
              All information shared during therapy sessions is confidential and protected. 
              However, confidentiality may be broken in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Imminent risk of harm to yourself or others</li>
              <li>Suspected abuse of a child, elderly person, or dependent adult</li>
              <li>Court order or legal requirement</li>
              <li>With your written consent for specific purposes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Limitations of Service</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Online therapy is not appropriate for all mental health conditions</li>
              <li>Services are not intended for crisis intervention or emergency care</li>
              <li>The therapist may recommend in-person treatment if clinically appropriate</li>
              <li>MindfulQALB reserves the right to discontinue services if terms are violated</li>
            </ul>
          </section>

          <section className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h2 className="text-xl font-semibold text-amber-800 mb-3">⚠️ Emergency Disclaimer</h2>
            <p className="text-amber-700">
              <strong>MindfulQALB is not an emergency service.</strong> If you are experiencing a mental health 
              emergency, suicidal thoughts, or are in immediate danger, please contact emergency services 
              immediately (911 or your local emergency number) or go to your nearest emergency room.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Intellectual Property</h2>
            <p className="text-gray-600">
              All content on this website, including text, graphics, logos, and software, is the property 
              of MindfulQALB and is protected by intellectual property laws. You may not reproduce, 
              distribute, or create derivative works without our written permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-600">
              MindfulQALB and its therapists shall not be liable for any indirect, incidental, special, 
              or consequential damages arising from the use of our services. Our liability is limited 
              to the amount paid for services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Governing Law</h2>
            <p className="text-gray-600">
              These Terms of Service are governed by and construed in accordance with the laws of India. 
              Any disputes shall be resolved in the courts of Karnataka, India.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
            <p className="text-gray-600 mb-4">
              For questions about these Terms of Service, please contact us:
            </p>
            <p className="text-gray-600">
              <strong>Email:</strong>{' '}
              <a href="mailto:mindfulqalb@gmail.com" className="text-lavender-600 hover:underline">
                mindfulqalb@gmail.com
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Changes to Terms</h2>
            <p className="text-gray-600">
              We reserve the right to modify these terms at any time. Changes will be effective 
              immediately upon posting to this page. Your continued use of our services after 
              changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600 text-sm">
              By using MindfulQALB's services, you acknowledge that you have read, understood, 
              and agree to be bound by these Terms of Service.
            </p>
          </div>
        </article>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <Link to="/privacy" className="text-lavender-600 hover:underline">
              ← Privacy Policy
            </Link>
            <Link to="/" className="hover:text-gray-700">
              Return to MindfulQALB
            </Link>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-gray-200 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} MindfulQALB. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TermsOfServicePage;
