import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Privacy Policy | Memora';
  }, []);

  return (
    <div className="min-h-screen bg-white py-20 px-6">
      <Helmet>
        <title>Privacy Policy | Memora</title>
        <meta name="description" content="Privacy Policy for Memora. Read about how we collect, use, and protect your data." />
      </Helmet>
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-black transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </button>

        <div className="prose prose-lg max-w-none text-gray-800">
          <h1 className="text-4xl font-bold text-black mb-4">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">
            <strong>Effective Date:</strong> March 17, 2026<br />
            <strong>Last Updated:</strong> March 17, 2026
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">1. Introduction</h2>
          <p className="mb-4">
            Welcome to Memora ("we", "our", or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform at memora.sbs (or your domain).
          </p>
          <p className="mb-4">
            Please read this policy carefully. If you disagree with its terms, please discontinue use of our platform.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">2. Information We Collect</h2>

          <h3 className="text-xl font-semibold text-black mt-6 mb-3">2.1 Information You Provide Directly</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Account Information:</strong> Name, email address, and password when you register.</li>
            <li><strong>Profile & Onboarding Data:</strong> Writing samples, tone preferences, and any content you submit to train your AI style profile.</li>
            <li><strong>Payment Information:</strong> Billing details processed securely via our third-party payment processor (Razorpay / Stripe). We do not store your card details.</li>
            <li><strong>Communications:</strong> Any messages you send us via email or support.</li>
          </ul>

          <h3 className="text-xl font-semibold text-black mt-6 mb-3">2.2 Information Collected Automatically</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Usage Data:</strong> Pages visited, features used, time spent, clicks, and interactions.</li>
            <li><strong>Device & Log Data:</strong> IP address, browser type, operating system, and referrer URLs.</li>
            <li><strong>Cookies & Tracking:</strong> We use cookies and similar tracking technologies to enhance your experience and analyze platform usage.</li>
          </ul>

          <h3 className="text-xl font-semibold text-black mt-6 mb-3">2.3 Third-Party Data</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>If you connect your LinkedIn or other accounts, we may receive data from those platforms subject to their own privacy policies.</li>
          </ul>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">3. How We Use Your Information</h2>
          <p className="mb-4">We use the information we collect to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Provide, operate, and maintain the Memora platform.</li>
            <li>Personalize your AI-generated content and style profile.</li>
            <li>Process transactions and send related information (receipts, invoices).</li>
            <li>Send you product updates, marketing communications (you may opt out at any time).</li>
            <li>Monitor and analyze usage trends to improve our platform.</li>
            <li>Detect and prevent fraud, abuse, or security incidents.</li>
            <li>Comply with legal obligations.</li>
          </ul>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">4. How We Share Your Information</h2>
          <p className="mb-4">We do not sell your personal data. We may share your information with:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Service Providers:</strong> Third-party vendors who assist in operating our platform (e.g., cloud hosting, payment processing, analytics, AI APIs).</li>
            <li><strong>Legal Requirements:</strong> If required by law, court order, or government authority.</li>
            <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your data may be transferred.</li>
            <li><strong>With Your Consent:</strong> For any other purpose with your explicit consent.</li>
          </ul>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">5. Data Retention</h2>
          <p className="mb-4">
            We retain your personal data for as long as your account is active or as needed to provide you services. You may request deletion of your account and associated data at any time by contacting us at privacy@memora.sbs.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">6. Your Rights</h2>
          <p className="mb-4">Depending on your location, you may have the right to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request deletion of your data.</li>
            <li>Opt out of marketing communications.</li>
            <li>Data portability.</li>
          </ul>
          <p className="mb-4">
            To exercise any of these rights, contact us at <strong>privacy@memora.sbs</strong>.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">7. Security</h2>
          <p className="mb-4">
            We implement industry-standard security measures including encryption in transit (HTTPS/TLS), secure password hashing, and access controls. However, no method of transmission over the internet is 100% secure.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">8. Cookies</h2>
          <p className="mb-4">We use cookies to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Keep you logged in.</li>
            <li>Remember your preferences.</li>
            <li>Analyze traffic via tools like Google Analytics.</li>
          </ul>
          <p className="mb-4">
            You can control cookies through your browser settings. Disabling cookies may affect platform functionality.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">9. Children's Privacy</h2>
          <p className="mb-4">
            Memora is not directed at children under 13 years of age. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us immediately.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">10. Changes to This Policy</h2>
          <p className="mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page with an updated effective date. Continued use of the platform after changes constitutes your acceptance.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">11. Contact Us</h2>
          <p className="mb-4">If you have questions or concerns about this Privacy Policy, please contact:</p>
          <p className="mb-4">
            <strong>Memora</strong><br />
            Email: privacy@memora.sbs<br />
            Address: Noida, Uttar Pradesh, India
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
