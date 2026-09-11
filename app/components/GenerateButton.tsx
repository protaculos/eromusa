import React from 'react'

export default function GenerateButton() {
  return (
    <button
      onClick={() => alert('Iniciando...')}
      className="w-72 py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-lg font-bold rounded-full shadow-lg shadow-pink-500/30 hover:from-pink-600 hover:to-pink-700 transition flex items-center justify-center space-x-2"
    >
      <span>Gerar Vídeo</span>
      <span>✨</span>
    </button>
  )
}
