"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import LoginModal from "@/components/LoginModal";

interface Plan {
  id: string;
  name: string;
  price: string;
  credits: string;
  creditsValue: number;
  description: string;
  features: string[];
  isPopular?: boolean;
}

const plans: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: "9.99",
    credits: "300 Credits",
    creditsValue: 300,
    description: "For casual creators",
    features: ["300 credits per month", "All templates", "720p exports", "Standard processing", "Email support"],
  },
  {
    id: "plus",
    name: "Plus",
    price: "29.99",
    credits: "1500 Credits",
    creditsValue: 1500,
    description: "For regular content creators",
    features: [
      "1500 credits per month",
      "All templates",
      "1080p exports",
      "Priority processing",
      "Email support",
    ],
    isPopular: true,
  },
  {
    id: "prime",
    name: "Prime",
    price: "49.99",
    credits: "3000 Credits",
    creditsValue: 3000,
    description: "For professional creators",
    features: [
      "3000 credits per month",
      "All templates + early access",
      "4K exports",
      "Ultra-fast processing",
      "Dedicated support",
      "API access",
    ],
  },
];

const faqs = [
  {
    question: "What counts as a credit?",
    answer:
      "Each credit is consumed when you generate a video. The number of credits depends on the template and export quality selected.",
  },
  {
    question: "Do unused credits roll over?",
    answer:
      "No, credits reset at the beginning of each billing cycle. Make sure to use them before they expire!",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept credit cards and other major payment methods. Your credits are added automatically as soon as the payment is confirmed.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes! Every new account starts with 50 free credits so you can try the platform before subscribing.",
  },
];

function PricingContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [waitingPayment, setWaitingPayment] = useState(false);
  const { user, refreshCredits, addCredits } = useAuth();

  // Handle return from payment
  useEffect(() => {
    const paymentId = sessionStorage.getItem("pending_payment_id");
    if (paymentId) {
      verifyPayment(paymentId);
      sessionStorage.removeItem("pending_payment_id");
    }
  }, [user]);

  // Open payment modal after successful login if a plan was selected
  useEffect(() => {
    if (user && selectedPlan && !showPaymentModal && !loginOpen) {
      setShowPaymentModal(true);
    }
  }, [user, selectedPlan, showPaymentModal, loginOpen]);

  const handlePaymentMethod = async () => {
    if (!selectedPlan || !user) return;

    setPaymentLoading(true);
    setPaymentError(null);

    try {
      // Get auth token from session
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ plan_id: selectedPlan.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment");
      }

      if (data.checkout_url) {
        sessionStorage.setItem("pending_payment_id", data.payment_id);
        sessionStorage.setItem("pending_internal_id", data.internal_id);

        // Abre em nova aba em vez de redirecionar
        const newWindow = window.open(data.checkout_url, "_blank");
        if (newWindow) {
          setWaitingPayment(true);
          setShowPaymentModal(false);
          setPaymentLoading(false);
        } else {
          // Popup bloqueado — fallback: redireciona
          window.location.href = data.checkout_url;
        }
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentError(error instanceof Error ? error.message : "Payment failed. Please try again.");
      setPaymentLoading(false);
    }
  };

  // Detecta quando o usuário volta da aba de pagamento
  useEffect(() => {
    if (!waitingPayment) return;

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        const internalId = sessionStorage.getItem("pending_internal_id");
        const vexutopiaId = sessionStorage.getItem("pending_payment_id");
        const paymentId = internalId || vexutopiaId;

        if (paymentId) {
          verifyPayment(paymentId);
          sessionStorage.removeItem("pending_payment_id");
          sessionStorage.removeItem("pending_internal_id");
          setWaitingPayment(false);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [waitingPayment]);

  const verifyPayment = async (paymentId: string, attempt: number = 1) => {
    setVerifyingPayment(true);
    setPaymentSuccess(false);
    setPaymentError(null);

    const MAX_ATTEMPTS = 30;

    try {
      const response = await fetch(`/api/payments/verify?payment_id=${paymentId}`);
      const data = await response.json();

      if (response.ok && data.status === "completed") {
        // Add credits locally for instant UI update
        if (selectedPlan) {
          addCredits(selectedPlan.creditsValue);
        }
        await refreshCredits();
        setPaymentSuccess(true);
      } else if (data.status === "failed") {
        setPaymentError("Payment failed. Please try again.");
      } else if (data.status === "pending") {
        if (attempt < MAX_ATTEMPTS) {
          setTimeout(() => verifyPayment(paymentId, attempt + 1), 2000);
          return;
        } else {
          setPaymentError("Payment is taking longer than expected. Your credits will be added automatically once confirmed. Please check back shortly.");
        }
      } else {
        setPaymentError("Unable to verify payment. Contact support if credits weren't added.");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      setPaymentError("Error verifying payment. Contact support if credits weren't added.");
    } finally {
      setVerifyingPayment(false);
    }
  };

  const handleGetStarted = (plan: Plan) => {
    console.log("handleGetStarted clicked, user:", user?.id);
    setSelectedPlan(plan);
    setPaymentError(null);
    setPaymentSuccess(false);

    // Se não estiver logado, abre o modal de login
    if (!user) {
      setLoginOpen(true);
    } else {
      // Se já estiver logado, abre o modal de pagamento
      setShowPaymentModal(true);
    }
  };

  return (
    <div className="pt-32 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Success Message */}
        {paymentSuccess && (
          <div className="mb-8 p-4 rounded-xl bg-green-500/20 border border-green-500/50 text-green-400 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-semibold">Payment Successful!</span>
            </div>
            <p className="text-sm text-green-400/80">Your credits have been added to your account.</p>
          </div>
        )}

        {/* Verifying Payment */}
        {verifyingPayment && (
          <div className="mb-8 p-4 rounded-xl bg-blue-500/20 border border-blue-500/50 text-blue-400 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="font-semibold">Verifying Payment...</span>
            </div>
            <p className="text-sm text-text-secondary">Please wait while we confirm your payment.</p>
          </div>
        )}

        {/* Waiting for Payment */}
        {waitingPayment && (
          <div className="mb-8 p-4 rounded-xl bg-card border border-border text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <svg className="w-5 h-5 animate-spin text-accent-orange" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="font-semibold text-white">Waiting for Payment...</span>
            </div>
            <p className="text-sm text-text-secondary">
              Complete the payment in the new tab. This page will update automatically when you return.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Choose Your Plan
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Start creating amazing AI-powered videos today. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col p-6 rounded-2xl border transition-all duration-300 ${
                plan.isPopular
                  ? "bg-gradient-to-b from-accent-orange/10 to-transparent border-accent-orange/50 shadow-lg shadow-accent-orange/10"
                  : "bg-card border-border hover:border-accent-orange/30"
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent-orange rounded-full text-xs font-semibold text-white">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-1">{plan.name}</h3>
                <p className="text-text-secondary text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">${plan.price}</span>
                  <span className="text-text-secondary text-sm">/month</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#DAA520" strokeWidth="1"/>
                    <text x="12" y="16" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#996515">$</text>
                  </svg>
                  <span className="text-text-secondary text-sm">{plan.credits}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-accent-orange flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-text-secondary text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleGetStarted(plan)}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                  plan.isPopular
                    ? "bg-accent-orange hover:bg-orange-600 text-white shadow-lg shadow-accent-orange/25"
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="text-white font-medium">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-text-secondary transition-transform duration-300 ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === index ? "max-h-40" : "max-h-0"
                  }`}
                >
                  <p className="px-4 pb-4 text-text-secondary text-sm">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method Modal */}
        {showPaymentModal && selectedPlan && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Select Payment Method</h3>
                <button
                  onClick={() => { setShowPaymentModal(false); setSelectedPlan(null); setPaymentError(null); }}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {paymentError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
                  {paymentError}
                </div>
              )}

              <div className="mb-6 p-3 rounded-lg bg-background">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">{selectedPlan.name} Plan</span>
                  <span className="text-accent-orange font-bold">${selectedPlan.price}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#DAA520" strokeWidth="1"/>
                    <text x="12" y="16" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#996515">$</text>
                  </svg>
                  <span className="text-text-secondary text-sm">{selectedPlan.credits} will be added</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handlePaymentMethod}
                  disabled={paymentLoading}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-background hover:bg-border/50 border border-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth={1.5}/>
                    <path d="M2 10h20" strokeWidth={1.5}/>
                    <path d="M6 15h4" strokeWidth={1.5} strokeLinecap="round"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-white font-medium">Credit/Debit Card</div>
                    <div className="text-text-secondary text-sm">Visa, Mastercard, Amex, and more</div>
                  </div>
                  {paymentLoading ? (
                    <svg className="w-5 h-5 text-text-secondary ml-auto animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-text-secondary ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                    </svg>
                  )}
                </button>

                <button
                  onClick={handlePaymentMethod}
                  disabled={paymentLoading}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-background hover:bg-border/50 border border-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-10 h-10 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="#1a1a2e"/>
                    <path d="M12 6v2m0 8v2m-3-6h5.5a1.5 1.5 0 010 3H10m2 0h.5a1.5 1.5 0 000-3H11" stroke="#FFD700" strokeWidth={1.5} strokeLinecap="round"/>
                    <circle cx="12" cy="12" r="9" stroke="#FFD700" strokeWidth={1} fill="none"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-white font-medium">Cryptocurrency</div>
                    <div className="text-text-secondary text-sm">BTC, ETH, USDT, and more</div>
                  </div>
                  {paymentLoading ? (
                    <svg className="w-5 h-5 text-text-secondary ml-auto animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-text-secondary ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                    </svg>
                  )}
                </button>
              </div>

              <p className="mt-4 text-center text-text-secondary text-xs">
                Secured by Vexutopia. Your payment information is encrypted.
              </p>
            </div>
          </div>
        )}

        <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} onLoginSuccess={() => {
          // Wait for user state to update, then refresh and open payment modal
          setTimeout(() => {
            refreshCredits();
            if (selectedPlan) {
              setShowPaymentModal(true);
            }
          }, 100);
        }} />
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="pt-32 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-card rounded w-64 mx-auto mb-12"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-card rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <PricingContent />
    </Suspense>
  );
}
