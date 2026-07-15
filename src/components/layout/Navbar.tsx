"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";
import { useAuth } from "@/context/AuthContext";
import LoginModal from "@/components/LoginModal";

export default function Navbar() {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { settings, updateSettings } = useSettings();
  const { user, credits, loading, signOut } = useAuth();
  const settingsRef = useRef<HTMLDivElement>(null);
  const mobileSettingsRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "en", label: "English" },
    { code: "pt", label: "Português" },
    { code: "es", label: "Español" },
    { code: "fr", label: "Français" },
    { code: "de", label: "Deutsch" },
    { code: "ja", label: "日本語" },
  ];

  const [selectedLang, setSelectedLang] = useState("en");

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const isOutsideSettings = settingsRef.current && !settingsRef.current.contains(target);
      const isOutsideMobile = mobileSettingsRef.current && !mobileSettingsRef.current.contains(target);
      const isOutsideBoth = isOutsideSettings && isOutsideMobile;
      if (isOutsideBoth) {
        setSettingsOpen(false);
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { href: "/", label: "Discover" },
    { href: "/gallery", label: "Gallery" },
    { href: "/pricing", label: "Pricing" },
  ];

  const handleSignOut = async () => {
    await signOut();
    setSettingsOpen(false);
  };

  // Settings Dropdown Component
  const SettingsDropdown = () => (
    <div
      className="absolute right-0 mt-2 w-64 rounded-xl bg-card border border-border shadow-xl z-50 overflow-visible"
      onClick={(e) => e.stopPropagation()}
    >
      {/* User Email - only when logged in */}
      {user && (
        <div className="px-4 py-3 border-b border-border">
          <div>
            <p className="text-sm text-white truncate">{user.email}</p>
            <p className="text-xs text-text-secondary mt-0.5">Signed in</p>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="py-2">
        {/* Credits / Upgrade */}
        <Link
          href="/pricing"
          className="flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-background transition-colors"
          onClick={() => setSettingsOpen(false)}
        >
          <span className="text-accent-orange">💰</span>
          Credits / Upgrade
        </Link>

        {/* Support */}
        <Link
          href="/support"
          className="flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-background transition-colors"
          onClick={() => setSettingsOpen(false)}
        >
          <span>🎧</span>
          Support
        </Link>

        {/* Language - with nested dropdown */}
        <div className="relative" ref={langRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLangOpen(!langOpen);
            }}
            className="flex items-center justify-between gap-3 px-4 py-2 text-sm text-white hover:bg-background transition-colors w-full"
          >
            <div className="flex items-center gap-3">
              <span>🌐</span>
              <span>Language</span>
            </div>
            <svg
              className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Language sub-dropdown */}
          {langOpen && (
            <div
              className="absolute right-full top-0 mr-1 w-44 rounded-xl bg-card border border-border shadow-xl z-[60] overflow-hidden origin-right animate-slide-lang sm:origin-right sm:right-full sm:top-0 sm:mr-1 max-sm:origin-top max-sm:left-0 max-sm:right-auto max-sm:top-full max-sm:mt-1 max-sm:w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="py-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setSelectedLang(lang.code);
                      setLangOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                      selectedLang === lang.code
                        ? "text-accent-orange bg-accent-orange/5"
                        : "text-white hover:bg-background"
                    }`}
                  >
                    {selectedLang === lang.code && (
                      <svg className="w-4 h-4 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span className={selectedLang === lang.code ? "" : "ml-6"}>{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Autoplay Toggle */}
        <div className="flex items-center justify-between px-4 py-2 text-sm hover:bg-background transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <span>▶️</span>
            <span className="text-white">Auto Play Videos</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateSettings({ autoPlayVideos: !settings.autoPlayVideos });
            }}
            className={`relative w-10 h-6 rounded-full transition-colors ${
              settings.autoPlayVideos ? "bg-accent-orange" : "bg-border"
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                settings.autoPlayVideos ? "left-5" : "left-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Separator + Login / Sign Out */}
      <div className="border-t border-border">
        {user ? (
          <>
            <div className="py-2">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-background transition-colors w-full"
              >
                <span>🚪</span>
                Sign Out
              </button>
            </div>
            <div className="border-t border-border py-1">
              <button
                onClick={() => {
                  setSettingsOpen(false);
                }}
                className="w-full px-4 py-1.5 text-[11px] text-red-500/70 hover:text-red-400 hover:bg-background transition-colors text-left"
              >
                Delete Account
              </button>
            </div>
          </>
        ) : (
          <div className="py-2">
            <button
              onClick={() => {
                setSettingsOpen(false);
                setLoginOpen(true);
              }}
              className="flex items-center gap-3 px-4 py-2 text-sm text-accent-orange hover:bg-background transition-colors w-full"
            >
              <span>🔑</span>
              Sign In / Sign Up
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop: Logo left, Nav center, Credits/Upgrade right */}
          {/* Mobile: Logo + Credits on top, Nav below */}
          <div className="flex flex-col sm:flex-row sm:items-center h-auto py-3 sm:h-16 gap-3 sm:gap-0">

            {/* Top Row on mobile - Logo left, Icons right */}
            {/* Desktop: Logo left, Nav center, Right elements right */}
            <div className="flex items-center justify-between sm:justify-between order-1 sm:order-1 gap-3 sm:flex-1">

              {/* Logo - Left on mobile and desktop */}
              <Link href="/" className="flex items-center gap-2 pl-2.5">
                <span className="text-white font-bold text-xl sm:text-2xl">EroMusa</span>
              </Link>

              {/* Credits + Settings - Right on mobile */}
              <div className="flex items-center gap-2 sm:hidden">
                {user ? (
                  /* Credits - Icon + number only (logged in only) */
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-card border border-border">
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" fill="#FBBF24"/>
                      <circle cx="12" cy="12" r="8" fill="#F59E0B"/>
                      <text x="12" y="16" textAnchor="middle" fill="#92400E" fontSize="10" fontWeight="bold">$</text>
                    </svg>
                    <span className="text-sm font-medium text-white">
                      {loading ? "..." : credits}
                    </span>
                  </div>
                ) : (
                  /* Login Button (logged out only) */
                  <button
                    onClick={() => setLoginOpen(true)}
                    className="px-4 py-2 rounded-lg bg-accent-orange hover:bg-orange-600 text-white text-sm font-semibold transition-colors"
                  >
                    Login
                  </button>
                )}

                {/* Settings - Mobile only */}
                <div className="relative sm:hidden" ref={mobileSettingsRef}>
                  <button
                    onClick={() => setSettingsOpen(!settingsOpen)}
                    className="p-2.5 rounded-lg text-text-secondary hover:text-white hover:bg-card/50"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  {settingsOpen && <SettingsDropdown />}
                </div>
              </div>
            </div>

            {/* Navigation Links - Bottom on mobile, Center on desktop */}
            <div className="flex items-center justify-center gap-2 md:gap-3 order-2 sm:order-2 sm:absolute sm:left-1/2 sm:-translate-x-1/2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                      isActive
                        ? "text-white bg-card"
                        : "text-text-secondary hover:text-white hover:bg-card/50"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Bottom Row - Credits + Upgrade + Settings on desktop (right), Hidden on mobile */}
            <div className="hidden sm:flex items-center gap-3 order-3">
              {user ? (
                /* Credits + Upgrade (logged in) */
                <>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
                    {/* Gold Coin Icon */}
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" fill="#FBBF24"/>
                      <circle cx="12" cy="12" r="8" fill="#F59E0B"/>
                      <text x="12" y="16" textAnchor="middle" fill="#92400E" fontSize="10" fontWeight="bold">$</text>
                    </svg>
                    <span className="text-sm font-medium text-white">
                      {loading ? "..." : credits}
                    </span>
                  </div>
                  <Link href="/pricing" className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-accent-orange hover:bg-orange-600 text-white text-xs sm:text-sm font-semibold transition-colors">
                    Upgrade
                  </Link>
                </>
              ) : (
                /* Login Button (logged out) */
                <button
                  onClick={() => setLoginOpen(true)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-accent-orange hover:bg-orange-600 text-white text-xs sm:text-sm font-semibold transition-colors"
                >
                  Sign In
                </button>
              )}

              {/* Settings - Desktop only */}
              <div className="relative" ref={settingsRef}>
                <button
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className="p-2.5 rounded-lg text-text-secondary hover:text-white hover:bg-card/50"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                {settingsOpen && <SettingsDropdown />}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}