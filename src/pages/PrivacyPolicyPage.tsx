import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';

const PrivacyPolicyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Privacy Policy | MindfulQALB';
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-500 text-sm mb-8">Last updated: February 2026</p>
          
          <p className="text-gray-600 mb-8">
            At MindfulQALB, your privacy is fundamental to the therapeutic relationship we build together. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
            when you use our services.
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
            <p className="text-gray-600 mb-4">We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Personal Information:</strong> Name, email address, phone number when you book sessions</li>
              <li><strong>Health Information:</strong> Information shared during therapy sessions (kept strictly confidential)</li>
              <li><strong>Payment Information:</strong> Processed securely through third-party payment processors (Razorpay, Stripe)</li>
              <li><strong>Technical Data:</strong> IP address, browser type, and device information for website functionality</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. How We Protect Your Information</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>All data is encrypted in transit using SSL/TLS encryption</li>
              <li>Session notes and clinical information are stored securely with restricted access</li>
              <li>We never share your personal health information without explicit consent</li>
              <li>Payment processing is handled by PCI-compliant third-party services</li>
              <li>We use session-based storage for sensitive data (not permanent storage)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>To provide and improve our therapy services</li>
              <li>To communicate with you about appointments and services</li>
              <li>To process payments for services rendered</li>
              <li>To comply with legal obligations and professional standards</li>
              <li>To send appointment reminders (with your consent)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Information Sharing</h2>
            <p className="text-gray-600 mb-4">
              We do not sell, trade, or rent your personal information. We may share information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>With your explicit consent</li>
              <li>With payment processors to complete transactions</li>
              <li>When required by law or to protect safety (mandatory reporting obligations)</li>
              <li>With professional supervisors under strict confidentiality agreements</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
            <p className="text-gray-600 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Access your personal information upon request</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your data (subject to legal retention requirements)</li>
              <li>Withdraw consent for non-essential data processing</li>
              <li>Receive a copy of your data in a portable format</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Clinical records are retained as required by professional licensing boards (typically 7 years)</li>
              <li>Payment records are retained for tax and legal purposes</li>
              <li>You may request deletion of non-essential data at any time</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Cookies and Tracking</h2>
            <p className="text-gray-600">
              We use essential cookies for website functionality. We do not use advertising cookies 
              or share data with advertising networks. Analytics data, if collected, is anonymized.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Contact Us</h2>
            <p className="text-gray-600 mb-4">
              For privacy-related questions or to exercise your rights, please contact us:
            </p>
            <p className="text-gray-600">
              <strong>Email:</strong>{' '}
              <a href="mailto:mindfulqalb@gmail.com" className="text-lavender-600 hover:underline">
                mindfulqalb@gmail.com
              </a>
            </p>
            <p className="text-gray-500 text-sm mt-2">We respond to all privacy inquiries within 48 hours.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Changes to This Policy</h2>
            <p className="text-gray-600">
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>
        </article>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <Link to="/terms" className="text-lavender-600 hover:underline">
              Terms of Service →
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

export default PrivacyPolicyPage;
