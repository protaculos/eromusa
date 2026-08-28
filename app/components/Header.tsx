import React from 'react'

export default function Header() {
  return (
    <header className="flex justify-between items-center p-4 bg-black border-b border-pink-500/20">
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
        </div>
        <span className="text-xl font-bold tracking-wider text-white">ourdream<span className="text-pink-500">.ai</span></span>
      </div>
      <div className="flex space-x-3">
        <button className="px-5 py-1.5 text-sm border border-pink-500/50 text-white rounded-full hover:bg-pink-500/10 transition">
          Login
        </button>
        <button className="px-5 py-1.5 text-sm bg-pink-500 text-white font-medium rounded-full hover:bg-pink-600 transition shadow-lg shadow-pink-500/30">
          Join Free
        </button>
      </div>
    </header>
  )
}
