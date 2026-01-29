import { useState } from 'react';

export function TermsModal({ isOpen, onClose, initialTab = 'terms' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('terms')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'terms'
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Terms of Service
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'privacy'
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Privacy Policy
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'terms' ? <TermsContent /> : <PrivacyContent />}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-violet-500 text-white rounded-xl font-medium hover:bg-violet-600 transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

function TermsContent() {
  return (
    <div className="prose prose-slate prose-sm max-w-none">
      <h2 id="legal-title" className="text-xl font-bold text-slate-800 mb-4">Terms of Service</h2>
      <p className="text-slate-500 text-sm mb-6">Last updated: January 2025</p>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-slate-700 mb-2">1. Acceptance of Terms</h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          By accessing and using Flowly ("the Service"), you agree to be bound by these Terms of Service.
          If you do not agree to these terms, please do not use the Service.
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-slate-700 mb-2">2. Description of Service</h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          Flowly is a productivity workspace application that provides task management, attendance tracking,
          expense tracking, and other productivity tools. The Service is provided "as is" and "as available."
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-slate-700 mb-2">3. User Accounts</h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          You are responsible for maintaining the confidentiality of your account credentials and for all
          activities that occur under your account. You agree to notify us immediately of any unauthorized
          use of your account.
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-slate-700 mb-2">4. User Data</h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          You retain ownership of all data you create within the Service. We do not claim any ownership
          rights to your content. You can export or delete your data at any time.
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-slate-700 mb-2">5. Acceptable Use</h3>
        <p className="text-slate-600 text-sm leading-relaxed mb-2">You agree not to:</p>
        <ul className="list-disc list-inside text-slate-600 text-sm space-y-1">
          <li>Use the Service for any illegal purpose</li>
          <li>Attempt to gain unauthorized access to the Service</li>
          <li>Interfere with or disrupt the Service</li>
          <li>Upload malicious code or content</li>
        </ul>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-slate-700 mb-2">6. Service Availability</h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          We strive to maintain high availability but do not guarantee uninterrupted access. The Service
          may be temporarily unavailable for maintenance or updates.
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-slate-700 mb-2">7. Limitation of Liability</h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          To the maximum extent permitted by law, Flowly shall not be liable for any indirect, incidental,
          special, or consequential damages arising from your use of the Service.
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-slate-700 mb-2">8. Changes to Terms</h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          We reserve the right to modify these terms at any time. Continued use of the Service after
          changes constitutes acceptance of the new terms.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">9. Contact</h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          For questions about these Terms, please contact us through our GitHub repository.
        </p>
      </section>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="prose prose-slate prose-sm max-w-none">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Privacy Policy</h2>
      <p className="text-slate-500 text-sm mb-6">Last updated: January 2025</p>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-slate-700 mb-2">1. Information We Collect</h3>
        <p className="text-slate-600 text-sm leading-relaxed mb-2">When you use Flowly, we collect:</p>
        <ul className="list-disc list-inside text-slate-600 text-sm space-y-1">
          <li><strong>Account Information:</strong> Name, email, and profile picture from Google Sign-In</li>
          <li><strong>User Content:</strong> Tasks, notes, attendance records, and other data you create</li>
          <li><strong>Usage Data:</strong> Basic analytics to improve the Service</li>
        </ul>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-slate-700 mb-2">2. How We Use Your Information</h3>
        <p className="text-slate-600 text-sm leading-relaxed mb-2">Your information is used to:</p>
        <ul className="list-disc list-inside text-slate-600 text-sm space-y-1">
          <li>Provide and maintain the Service</li>
          <li>Sync your data across devices</li>
          <li>Improve user experience</li>
          <li>Send important service updates (if applicable)</li>
        </ul>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-slate-700 mb-2">3. Data Storage & Security</h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          Your data is stored securely using Google Firebase, which employs industry-standard encryption
          and security measures. Data is stored in secure data centers and transmitted over encrypted
          connections (HTTPS/TLS).
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-slate-700 mb-2">4. Data Sharing</h3>
        <p className="text-slate-600 text-sm leading-relaxed mb-2">
          <strong>We do NOT sell, trade, or share your personal data with third parties.</strong>
        </p>
        <p className="text-slate-600 text-sm leading-relaxed">
          Your data may only be disclosed if required by law or to protect our rights.
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-slate-700 mb-2">5. Your Rights</h3>
        <p className="text-slate-600 text-sm leading-relaxed mb-2">You have the right to:</p>
        <ul className="list-disc list-inside text-slate-600 text-sm space-y-1">
          <li><strong>Access:</strong> View all data associated with your account</li>
          <li><strong>Export:</strong> Download your data at any time</li>
          <li><strong>Delete:</strong> Request deletion of your account and all associated data</li>
          <li><strong>Correct:</strong> Update or correct your information</li>
        </ul>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-slate-700 mb-2">6. Cookies & Local Storage</h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          We use browser local storage to cache data for offline access and improve performance.
          No tracking cookies are used for advertising purposes.
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-slate-700 mb-2">7. Children's Privacy</h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          Flowly is not intended for children under 13. We do not knowingly collect information from
          children under 13.
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold text-slate-700 mb-2">8. Changes to This Policy</h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          We may update this Privacy Policy periodically. We will notify users of significant changes
          through the Service.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">9. Contact Us</h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          For privacy-related questions or to exercise your data rights, please contact us through
          our GitHub repository.
        </p>
      </section>
    </div>
  );
}
