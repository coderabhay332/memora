import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const TermsAndConditions = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Terms & Conditions | Memora';
  }, []);

  return (
    <div className="min-h-screen bg-white py-20 px-6">
      <Helmet>
        <title>Terms & Conditions | Memora</title>
        <meta name="description" content="Terms & Conditions for Memora. Read our terms of service and acceptable use policy." />
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
          <h1 className="text-4xl font-bold text-black mb-4">Terms & Conditions</h1>
          <p className="text-gray-600 mb-8">
            <strong>Effective Date:</strong> March 17, 2026<br />
            <strong>Last Updated:</strong> March 17, 2026
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing or using Memora ("Platform", "Service"), you agree to be bound by these Terms & Conditions ("Terms"). If you do not agree to these Terms, do not use our platform.
          </p>
          <p className="mb-4">
            These Terms apply to all users including visitors, registered users, and paying subscribers.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">2. Description of Service</h2>
          <p className="mb-4">
            Memora is an AI-powered SaaS platform that helps users generate, manage, and optimize content. Features may include AI content generation, style profiling, post scheduling, and analytics.
          </p>
          <p className="mb-4">
            We reserve the right to modify, suspend, or discontinue any part of the service at any time with reasonable notice.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">3. Eligibility</h2>
          <p className="mb-4">
            You must be at least 18 years old to use Memora. By using the platform, you represent and warrant that you meet this requirement and have the legal capacity to enter into a binding agreement.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">4. Account Registration</h2>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You are responsible for all activity that occurs under your account.</li>
            <li>You must provide accurate and complete information during registration.</li>
            <li>You must notify us immediately of any unauthorized use of your account at support@memora.sbs.</li>
          </ul>
          <p className="mb-4">
            We reserve the right to terminate accounts that violate these Terms.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">5. Subscription & Billing</h2>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Memora offers subscription-based plans (monthly/annual) as described on our pricing page.</li>
            <li>All fees are charged in INR (Indian Rupees) unless otherwise stated.</li>
            <li>Subscriptions automatically renew at the end of each billing cycle unless cancelled before the renewal date.</li>
            <li>You authorize us to charge your payment method on a recurring basis for the applicable subscription fee.</li>
            <li>Prices are subject to change with 30 days' notice.</li>
          </ul>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">6. Acceptable Use</h2>
          <p className="mb-4">You agree NOT to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Use the platform to generate spam, misleading content, or content that violates third-party terms (e.g., LinkedIn's Terms of Service).</li>
            <li>Reverse engineer, decompile, or attempt to extract the source code of the platform.</li>
            <li>Use the platform to infringe upon intellectual property rights of others.</li>
            <li>Upload malicious content, viruses, or code designed to disrupt the platform.</li>
            <li>Resell, sublicense, or commercially redistribute the platform without our written consent.</li>
            <li>Use automated bots or scrapers against the platform without written permission.</li>
            <li>Violate any applicable laws or regulations.</li>
          </ul>
          <p className="mb-4">
            We reserve the right to suspend or terminate your account if you violate these rules.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">7. Intellectual Property</h2>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Our Content:</strong> Memora and its original content, features, and functionality are owned by us and protected by intellectual property laws.</li>
            <li><strong>Your Content:</strong> You retain ownership of content you create or upload. By using the platform, you grant us a limited, non-exclusive license to process your content solely to provide the service.</li>
            <li><strong>AI-Generated Content:</strong> Content generated by the AI on your behalf is yours to use. We make no guarantees about uniqueness or freedom from third-party claims.</li>
          </ul>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">8. Third-Party Services</h2>
          <p className="mb-4">
            Memora integrates with third-party services (e.g., LinkedIn, Razorpay, AWS, Anthropic). Your use of those services is governed by their respective terms and privacy policies. We are not responsible for the availability, accuracy, or practices of third-party services.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">9. Disclaimer of Warranties</h2>
          <p className="mb-4 uppercase">
            THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.
          </p>
          <p className="mb-4 uppercase">
            WE DO NOT GUARANTEE SPECIFIC RESULTS FROM USE OF OUR AI FEATURES, INCLUDING THE PERFORMANCE OF CONTENT ON SOCIAL MEDIA PLATFORMS.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">10. Limitation of Liability</h2>
          <p className="mb-4 uppercase">
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, MEMORA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF OR INABILITY TO USE THE PLATFORM.
          </p>
          <p className="mb-4 uppercase">
            OUR TOTAL LIABILITY TO YOU SHALL NOT EXCEED THE AMOUNT PAID BY YOU TO US IN THE THREE (3) MONTHS PRECEDING THE CLAIM.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">11. Indemnification</h2>
          <p className="mb-4">
            You agree to indemnify and hold harmless Memora and its founders, employees, and agents from any claims, liabilities, damages, or expenses (including legal fees) arising from your use of the platform or violation of these Terms.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">12. Termination</h2>
          <p className="mb-4">
            We may suspend or terminate your access to the platform at our discretion, with or without cause, with reasonable notice. Upon termination, your right to use the platform ceases immediately. Provisions that by nature should survive termination will remain in effect.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">13. Governing Law & Dispute Resolution</h2>
          <p className="mb-4">
            These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms or your use of the platform shall be subject to the exclusive jurisdiction of the courts in Noida, Uttar Pradesh, India.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">14. Changes to Terms</h2>
          <p className="mb-4">
            We reserve the right to update these Terms at any time. We will notify you of material changes via email or an in-platform notice. Continued use after changes constitutes acceptance of the revised Terms.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">15. Contact Us</h2>
          <p className="mb-4">For questions about these Terms, contact:</p>
          <p className="mb-4">
            <strong>Memora</strong><br />
            Email: support@memora.sbs<br />
            Address: Noida, Uttar Pradesh, India
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
