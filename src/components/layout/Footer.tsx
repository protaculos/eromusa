import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background py-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-text-secondary text-xs">
          © {new Date().getFullYear()} EroMusa AI. All rights reserved.
        </div>

        <div className="flex items-center gap-6">
          <Link href="/support" className="text-text-secondary hover:text-white text-xs transition-colors">
            Support
          </Link>
          <Link href="/terms" className="text-text-secondary hover:text-white text-xs transition-colors">
            Terms of Use
          </Link>
          <Link href="/privacy" className="text-text-secondary hover:text-white text-xs transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}