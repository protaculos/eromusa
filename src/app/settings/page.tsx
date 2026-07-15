"use client";

import { useState } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const settingsOptions = [
    {
      id: "email",
      icon: "📧",
      title: "Change Email",
      description: "Update your account email address",
      modalTitle: "Change Email",
      placeholder: "New email address",
      buttonText: "Update Email",
    },
    {
      id: "password",
      icon: "🔒",
      title: "Change Password",
      description: "Update your account password",
      modalTitle: "Change Password",
      fields: [
        { id: "current", placeholder: "Current password" },
        { id: "new", placeholder: "New password" },
        { id: "confirm", placeholder: "Confirm new password" },
      ],
      buttonText: "Update Password",
    },
    {
      id: "language",
      icon: "🌐",
      title: "Change Language",
      description: "Select your preferred language",
      modalTitle: "Change Language",
      options: ["English", "Português", "Español", "Français", "Deutsch", "日本語"],
      buttonText: "Save Language",
    },
  ];

  const dangerOptions = [
    {
      id: "signout",
      icon: "🚪",
      title: "Sign Out",
      description: "Sign out of your account",
      modalTitle: "Sign Out",
      message: "Are you sure you want to sign out of your account?",
      buttonText: "Sign Out",
      isDanger: false,
    },
    {
      id: "delete",
      icon: "⚠️",
      title: "Delete Account",
      description: "Permanently delete your account and all data",
      modalTitle: "Delete Account",
      message: "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.",
      buttonText: "Delete Account",
      isDanger: true,
    },
  ];

  return (
    <div className="pt-32 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-text-secondary">Manage your account preferences and security</p>
        </div>

        {/* Settings Options */}
        <div className="space-y-4 mb-8">
          {/* Support - as Link */}
          <Link
            href="/support"
            className="w-full flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-accent-orange/50 transition-colors text-left"
          >
            <span className="text-2xl">🎧</span>
            <div className="flex-1">
              <h3 className="text-white font-medium">Support</h3>
              <p className="text-text-secondary text-sm">Get help and contact support</p>
            </div>
            <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {/* Other options */}
          {settingsOptions.filter(o => o.id !== "support").map((option) => (
            <button
              key={option.id}
              onClick={() => setActiveModal(option.id)}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-accent-orange/50 transition-colors text-left"
            >
              <span className="text-2xl">{option.icon}</span>
              <div className="flex-1">
                <h3 className="text-white font-medium">{option.title}</h3>
                <p className="text-text-secondary text-sm">{option.description}</p>
              </div>
              <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* Danger Zone */}
        <div className="border-t border-border pt-8">
          <h2 className="text-lg font-semibold text-white mb-4">Danger Zone</h2>
          <div className="space-y-4">
            {dangerOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setActiveModal(option.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-colors text-left ${
                  option.isDanger
                    ? "bg-red-500/10 border-red-500/30 hover:bg-red-500/20"
                    : "bg-card border-border hover:border-text-secondary"
                }`}
              >
                <span className="text-2xl">{option.icon}</span>
                <div className="flex-1">
                  <h3 className={`font-medium ${option.isDanger ? "text-red-400" : "text-white"}`}>
                    {option.title}
                  </h3>
                  <p className="text-text-secondary text-sm">{option.description}</p>
                </div>
                <svg className={`w-5 h-5 ${option.isDanger ? "text-red-400" : "text-text-secondary"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Modals */}
        {activeModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setActiveModal(null)}
          >
            <div
              className="w-full max-w-md p-6 rounded-2xl bg-card border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Get the option data */}
              {settingsOptions.filter(o => o.id === activeModal).map((option) => {
                if (option.id !== activeModal) return null;

                const isDanger = "isDanger" in option && option.isDanger;
                const hasFields = "fields" in option && option.fields;
                const hasOptions = "options" in option && option.options;

                return (
                  <>
                    <h2 className="text-xl font-bold text-white mb-4">{option.modalTitle}</h2>

                    {hasFields ? (
                      <div className="space-y-3 mb-6">
                        {option.fields.map((field) => (
                          <input
                            key={field.id}
                            type={field.id === "current" || field.id.includes("password") ? "password" : "text"}
                            placeholder={field.placeholder}
                            className="w-full px-4 py-3 rounded-lg bg-background border border-border text-white placeholder-text-secondary focus:outline-none focus:border-accent-orange transition-colors"
                          />
                        ))}
                      </div>
                    ) : hasOptions ? (
                      <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                        {option.options.map((opt) => (
                          <button
                            key={opt}
                            className="w-full px-4 py-3 rounded-lg bg-background border border-border text-white text-left hover:border-accent-orange transition-colors"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        placeholder={option.placeholder}
                        rows={4}
                        className="w-full px-4 py-3 rounded-lg bg-background border border-border text-white placeholder-text-secondary focus:outline-none focus:border-accent-orange transition-colors resize-none mb-6"
                      />
                    )}

                    {"message" in option && (
                      <p className={`text-sm mb-6 ${isDanger ? "text-red-400" : "text-text-secondary"}`}>
                        {option.message as string}
                      </p>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => setActiveModal(null)}
                        className="flex-1 px-4 py-3 rounded-lg bg-background border border-border text-white hover:bg-card transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                          isDanger
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "bg-accent-orange hover:bg-orange-600 text-white"
                        }`}
                      >
                        {option.buttonText}
                      </button>
                    </div>
                  </>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}