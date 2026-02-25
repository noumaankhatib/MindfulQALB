import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Instagram, Linkedin, Calendar } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const ContactPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Contact | MindfulQALB';
  }, []);

  const email = 'mindfulqalb@gmail.com';
  const socialLinks = [
    { name: 'Instagram', href: 'https://www.instagram.com/mindfulqalb', icon: Instagram },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/in/aqsa-khatib-0a9b6218b', icon: Linkedin },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-cream-50/30">
      <Navigation />
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-lavender-600 transition-colors text-sm mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="bg-white rounded-2xl border border-lavender-100 shadow-gentle overflow-hidden">
            <div className="bg-gradient-to-r from-lavender-50 to-white px-6 py-6 border-b border-lavender-100">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Contact details</h1>
              <p className="text-gray-600 mt-1">Get in touch for appointments or general enquiries.</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-lavender-50/50 border border-lavender-100">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-lavender-100 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-lavender-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <a
                    href={`mailto:${email}`}
                    className="text-lavender-600 hover:text-lavender-700 hover:underline"
                  >
                    {email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-lavender-50/50 border border-lavender-100">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-lavender-100 flex items-center justify-center">
                  <Instagram className="w-5 h-5 text-lavender-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-1">Social</p>
                  <div className="flex flex-wrap gap-3">
                    {socialLinks.map(({ name, href, icon: Icon }) => (
                      <a
                        key={name}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-lavender-600 hover:text-lavender-700 hover:underline"
                      >
                        <Icon className="w-4 h-4" />
                        {name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-lavender-100">
                <Link
                  to="/#get-help"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-lavender-600 to-lavender-700 shadow-lg shadow-lavender-500/25 hover:shadow-lavender-500/40 transition-all"
                >
                  <Calendar className="w-5 h-5" />
                  Book a session
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
