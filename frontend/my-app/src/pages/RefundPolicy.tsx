import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const RefundPolicy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Refund Policy | Memora';
  }, []);

  return (
    <div className="min-h-screen bg-white py-20 px-6">
      <Helmet>
        <title>Refund Policy | Memora</title>
        <meta name="description" content="Refund & Cancellation Policy for Memora. Read about our 7-day money-back guarantee and cancellation process." />
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
          <h1 className="text-4xl font-bold text-black mb-4">Refund & Cancellation Policy</h1>
          <p className="text-gray-600 mb-8">
            <strong>Effective Date:</strong> March 17, 2026<br />
            <strong>Last Updated:</strong> March 17, 2026
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">1. Overview</h2>
          <p className="mb-4">
            At Memora, we want you to be fully satisfied with your subscription. This Refund & Cancellation Policy outlines your rights and our obligations regarding refunds and cancellations.
          </p>
          <p className="mb-4">
            Please read this policy carefully before purchasing any subscription plan.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">2. Subscription Plans</h2>
          <p className="mb-4">Memora offers the following subscription types:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Monthly Plans</strong> — billed every 30 days.</li>
            <li><strong>Annual Plans</strong> — billed once per year.</li>
          </ul>
          <p className="mb-4">
            All subscriptions automatically renew unless cancelled before the next billing date.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">3. Cancellation Policy</h2>
          <h3 className="text-xl font-semibold text-black mt-6 mb-3">How to Cancel</h3>
          <p className="mb-4">You may cancel your subscription at any time by:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Navigating to <strong>Account Settings → Subscription → Cancel Plan</strong>, or</li>
            <li>Emailing us at <strong>support@memora.sbs</strong> with the subject line "Cancel Subscription".</li>
          </ul>

          <h3 className="text-xl font-semibold text-black mt-6 mb-3">What Happens After Cancellation</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Your subscription will remain active until the end of the current billing period.</li>
            <li>You will NOT be charged for the next billing cycle.</li>
            <li>You will lose access to premium features at the end of the billing period.</li>
            <li>Your data will be retained for 30 days post-cancellation before permanent deletion, allowing you to re-subscribe and restore access.</li>
          </ul>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">4. Refund Policy</h2>
          
          <h3 className="text-xl font-semibold text-black mt-6 mb-3">7-Day Money-Back Guarantee (New Users)</h3>
          <p className="mb-4">
            If you are a <strong>first-time subscriber</strong> and are not satisfied with the platform, you may request a full refund within <strong>7 days</strong> of your initial purchase. No questions asked.
          </p>
          <p className="mb-4">
            To request a refund under this guarantee, email <strong>support@memora.sbs</strong> with:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Subject: "Refund Request"</li>
            <li>Your registered email address</li>
            <li>Brief reason (optional, helps us improve)</li>
          </ul>

          <h3 className="text-xl font-semibold text-black mt-6 mb-3">After 7 Days — Monthly Plans</h3>
          <p className="mb-4">
            Refunds are <strong>not provided</strong> for monthly subscriptions after the 7-day window has passed. You may cancel to prevent future charges, but the current billing period will not be refunded.
          </p>
          <p className="mb-4 italic">
            "Refunds are processed via Cashfree Payments. Processing time depends on your bank and may take up to 5–10 business days after approval."
          </p>

          <h3 className="text-xl font-semibold text-black mt-6 mb-3">After 7 Days — Annual Plans</h3>
          <p className="mb-4">
            For annual plans cancelled after 7 days, we offer a <strong>pro-rated refund</strong> for the remaining unused months, at our discretion. To request this, contact us at <strong>support@memora.sbs</strong>.
          </p>

          <h3 className="text-xl font-semibold text-black mt-6 mb-3">Exceptions — No Refund Scenarios</h3>
          <p className="mb-4">Refunds will <strong>not</strong> be issued in the following cases:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Account suspended or terminated due to violation of our Terms & Conditions.</li>
            <li>Requests made after 7 days for monthly plans.</li>
            <li>Failure to cancel before the auto-renewal date (we send renewal reminder emails).</li>
            <li>Dissatisfaction with AI-generated content quality (our AI features are available to trial before purchasing).</li>
          </ul>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">5. Upgrade / Downgrade</h2>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Upgrading</strong> mid-cycle: You will be charged the prorated difference immediately.</li>
            <li><strong>Downgrading</strong> mid-cycle: The change takes effect at the start of the next billing cycle. No partial refund is issued for the current period.</li>
          </ul>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">6. Free Trial (if applicable)</h2>
          <p className="mb-4">If Memora offers a free trial:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>No payment is required during the trial period.</li>
            <li>You must cancel before the trial ends to avoid being charged.</li>
            <li>Trial periods cannot be extended.</li>
          </ul>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">7. Payment Disputes & Chargebacks</h2>
          <p className="mb-4">
            If you believe you were charged incorrectly, please contact us at <strong>support@memora.sbs</strong> before initiating a chargeback with your bank. Chargebacks initiated without contacting us first may result in permanent account suspension.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">8. Processing Time</h2>
          <p className="mb-4">
            Approved refunds will be processed within <strong>5–10 business days</strong> and credited to your original payment method. Processing time may vary depending on your bank or payment provider.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">9. Changes to This Policy</h2>
          <p className="mb-4">
            We may update this policy from time to time. Changes will be posted on this page with an updated effective date. Continued use of the platform after changes constitutes your acceptance.
          </p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-black mt-8 mb-4">10. Contact Us</h2>
          <p className="mb-4">For all refund and cancellation requests:</p>
          <p className="mb-4">
            <strong>Memora Support</strong><br />
            Email: support@memora.sbs<br />
            Address: Noida, Uttar Pradesh, India<br />
            Response Time: Within 1–2 business days
          </p>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
