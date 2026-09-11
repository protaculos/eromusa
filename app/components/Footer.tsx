'use client'

export default function Footer() {
  return (
    <footer className="mt-auto pt-6 pb-8 border-t border-gray-800 text-center">
      <div className="text-xs text-gray-500">
        © 2026 EroMusa.com — All rights reserved.
      </div>
      <div className="flex justify-center gap-4 md:gap-6 mt-3 text-xs text-gray-500">
        <a
          href="/termos-de-uso"
          className="hover:text-gray-300 transition-colors"
        >
          Termo de Uso
        </a>
        <span className="text-gray-700">|</span>
        <a
          href="/politica-de-privacidade"
          className="hover:text-gray-300 transition-colors"
        >
          Política de Privacidade
        </a>
        <span className="text-gray-700">|</span>
        <a
          href="/suporte"
          className="hover:text-gray-300 transition-colors"
        >
          Suporte
        </a>
      </div>
    </footer>
  )
}
