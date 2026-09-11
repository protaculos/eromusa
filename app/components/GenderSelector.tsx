'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function GenderSelector() {
  const pathname = usePathname()

  const tabs = [
    {
      name: 'Criar',
      href: '/',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      name: 'Galeria',
      href: '/galeria',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
    },
    {
      name: 'Créditos',
      href: '/creditos',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="flex justify-center space-x-3 mb-6">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-full border transition-all duration-200 ${
              isActive
                ? 'bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-500/30 font-bold'
                : 'bg-black/30 border-gray-700 text-gray-300 hover:bg-black/40 hover:text-white font-medium'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="text-sm">{tab.name}</span>
          </Link>
        )
      })}
    </div>
  )
}
