import React from 'react'

export default function GenerateButton() {
  return (
    <div className="flex justify-center mb-12 px-4">
      <button
        onClick={() => alert('Iniciando...')}
        className="w-full max-w-xl py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-lg font-bold rounded-full shadow-lg shadow-pink-500/30 hover:from-pink-600 hover:to-pink-700 transition flex items-center justify-center space-x-2"
      >
        <span>Begin</span>
        <span>✨</span>
      </button>
    </div>
  )
}
