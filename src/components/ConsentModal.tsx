import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Shield, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  FileText,
  AlertCircle,
  Download
} from 'lucide-react';
import { consentFormData, createConsentRecord, ConsentRecord } from '../data/consentForm';
import { CONSENT_CONFIG } from '../config/paymentConfig';

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (record: ConsentRecord) => void;
  sessionType: string;
  customerEmail: string;
}

const ConsentModal = ({ 
  isOpen, 
  onClose, 
  onAccept, 
  sessionType,
  customerEmail 
}: ConsentModalProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['services']));
  const [checkedAcknowledgments, setCheckedAcknowledgments] = useState<Set<number>>(new Set());
  const [signature, setSignature] = useState('');
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setExpandedSections(new Set(['services']));
      setCheckedAcknowledgments(new Set());
      setSignature('');
      setHasScrolledToBottom(false);
      setError(null);
    }
  }, [isOpen]);

  // Track scroll to bottom
  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 50) {
        setHasScrolledToBottom(true);
      }
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const toggleAcknowledgment = (index: number) => {
    const newChecked = new Set(checkedAcknowledgments);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedAcknowledgments(newChecked);
    setError(null);
  };

  const allAcknowledgmentsChecked = 
    checkedAcknowledgments.size === consentFormData.acknowledgments.length;

  const handleAccept = () => {
    if (!allAcknowledgmentsChecked) {
      setError('Please acknowledge all items above');
      return;
    }

    if (!signature.trim()) {
      setError('Please type your full name as your electronic signature');
      return;
    }

    if (signature.trim().length < 2) {
      setError('Please enter a valid name');
      return;
    }

    // Create consent record for compliance tracking
    const record = createConsentRecord(
      sessionType,
      signature.trim(),
      customerEmail,
      consentFormData.acknowledgments.filter((_, i) => checkedAcknowledgments.has(i))
    );

    // Store locally if configured
    if (CONSENT_CONFIG.STORE_CONSENT_LOCALLY) {
      const existingRecords = JSON.parse(localStorage.getItem('consentRecords') || '[]');
      existingRecords.push(record);
      localStorage.setItem('consentRecords', JSON.stringify(existingRecords));
    }

    onAccept(record);
  };

  const handleDownload = () => {
    // Generate a text version of the consent form
    let text = `${consentFormData.title}\n${'='.repeat(50)}\n\n`;
    text += `${consentFormData.introduction}\n\n`;
    
    consentFormData.sections.forEach(section => {
      text += `${section.title}\n${'-'.repeat(30)}\n${section.content}\n\n`;
    });

    text += `Acknowledgments:\n${'-'.repeat(30)}\n`;
    consentFormData.acknowledgments.forEach((ack, i) => {
      text += `${i + 1}. ${ack}\n`;
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MindfulQalb-Consent-Form.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-lavender-500 to-lavender-600 text-white p-5 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Informed Consent</h3>
                    <p className="text-sm text-white/80">Please read and accept to continue</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownload}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    title="Download consent form"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div 
              ref={contentRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-5"
            >
              {/* Introduction */}
              <div className="mb-6 p-4 bg-lavender-50/50 rounded-xl border border-lavender-100">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {consentFormData.introduction}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Last updated: {consentFormData.lastUpdated}
                </p>
              </div>

              {/* Consent Sections */}
              <div className="space-y-3 mb-6">
                {consentFormData.sections.map((section) => (
                  <div 
                    key={section.id}
                    className="border border-gray-200 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-lavender-500" />
                        <span className="font-medium text-gray-800 text-sm">
                          {section.title}
                        </span>
                        {section.required && (
                          <span className="text-xs px-2 py-0.5 bg-lavender-100 text-lavender-700 rounded-full">
                            Required
                          </span>
                        )}
                      </div>
                      {expandedSections.has(section.id) ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {expandedSections.has(section.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 bg-white border-t border-gray-100">
                            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                              {section.content}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Scroll Indicator */}
              {!hasScrolledToBottom && (
                <div className="text-center text-sm text-gray-500 mb-4">
                  <ChevronDown className="w-4 h-4 mx-auto animate-bounce" />
                  Scroll to read all sections
                </div>
              )}

              {/* Acknowledgments */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-lavender-500" />
                  Acknowledgments
                </h4>
                <div className="space-y-2">
                  {consentFormData.acknowledgments.map((ack, index) => (
                    <label
                      key={index}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        checkedAcknowledgments.has(index)
                          ? 'bg-lavender-50 border-lavender-300'
                          : 'bg-white border-gray-200 hover:border-lavender-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checkedAcknowledgments.has(index)}
                        onChange={() => toggleAcknowledgment(index)}
                        className="mt-0.5 w-4 h-4 rounded border-gray-300 text-lavender-600 focus:ring-lavender-500"
                      />
                      <span className="text-sm text-gray-700">{ack}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Electronic Signature */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Electronic Signature *
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  By typing your full name below, you agree that this constitutes a legally binding electronic signature.
                </p>
                <input
                  type="text"
                  value={signature}
                  onChange={(e) => {
                    setSignature(e.target.value);
                    setError(null);
                  }}
                  placeholder="Type your full name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-lavender-300 focus:border-lavender-400 transition-colors font-medium"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 bg-gray-50 border-t border-gray-100 flex-shrink-0">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAccept}
                  disabled={!allAcknowledgmentsChecked || !signature.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-lg hover:from-lavender-600 hover:to-lavender-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  I Agree & Continue
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center mt-3">
                Your consent will be recorded for compliance purposes
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConsentModal;
