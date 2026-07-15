"use client";

import { useState } from "react";

export default function SupportPage() {
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder - not functional yet
    alert("Support message sent! (This is a placeholder)");
  };

  return (
    <div className="pt-32 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Support</h1>
          <p className="text-text-secondary">Get help with your account or report an issue</p>
        </div>

        {/* Contact Form */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="How can we help you?"
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-white placeholder-text-secondary focus:outline-none focus:border-accent-orange transition-colors"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe your issue or question in detail..."
                rows={6}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-white placeholder-text-secondary focus:outline-none focus:border-accent-orange transition-colors resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full px-6 py-3 rounded-lg bg-accent-orange hover:bg-orange-600 text-white font-semibold transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-card border border-border">
              <h3 className="text-white font-medium mb-2">How do I earn more credits?</h3>
              <p className="text-text-secondary text-sm">You can earn credits by purchasing our premium plans or participating in special promotions. Visit the Pricing page for more details.</p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border">
              <h3 className="text-white font-medium mb-2">What video formats are supported?</h3>
              <p className="text-text-secondary text-sm">We support MP4, MOV, and AVI formats. The recommended format is MP4 with H.264 codec for best quality.</p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border">
              <h3 className="text-white font-medium mb-2">How long does video processing take?</h3>
              <p className="text-text-secondary text-sm">Processing time varies based on the complexity of your template and current server load. Typically, it takes between 1-5 minutes.</p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 p-6 rounded-2xl bg-card border border-border">
          <h2 className="text-xl font-bold text-white mb-4">Other Ways to Contact Us</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📧</span>
              <div>
                <p className="text-text-secondary text-sm">Email</p>
                <p className="text-white">sac@eromusa.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">⏰</span>
              <div>
                <p className="text-text-secondary text-sm">Response Time</p>
                <p className="text-white">Usually within 24 hours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}