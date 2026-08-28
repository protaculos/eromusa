import React, { useState } from 'react'

export default function StyleSelector() {
  const [selectedStyle, setSelectedStyle] = useState('Realistic')

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto mb-8 px-4">
      {/* Realistic Card */}
      <div
        onClick={() => setSelectedStyle('Realistic')}
        className={`relative rounded-3xl overflow-hidden border-2 cursor-pointer transition-all duration-300 group ${
          selectedStyle === 'Realistic' ? 'border-pink-500 shadow-xl shadow-pink-500/20' : 'border-gray-800 opacity-70 hover:opacity-100'
        }`}
      >
        <div className="h-80 bg-gray-900 relative flex flex-col justify-end p-6">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop")' }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

          {selectedStyle === 'Realistic' && (
            <div className="absolute top-4 right-4 w-7 h-7 bg-pink-500 rounded-full flex items-center justify-center text-white shadow-md">
              ✓
            </div>
          )}

          <div className="relative z-10">
            <h3 className="text-2xl font-extrabold text-white tracking-widest">REALISTIC</h3>
          </div>
        </div>
      </div>

      {/* Anime Card */}
      <div
        onClick={() => setSelectedStyle('Anime')}
        className={`relative rounded-3xl overflow-hidden border-2 cursor-pointer transition-all duration-300 group ${
          selectedStyle === 'Anime' ? 'border-pink-500 shadow-xl shadow-pink-500/20' : 'border-gray-800 opacity-70 hover:opacity-100'
        }`}
      >
        <div className="h-80 bg-gray-900 relative flex flex-col justify-end p-6">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1000&auto=format&fit=crop")' }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

          {selectedStyle === 'Anime' && (
            <div className="absolute top-4 right-4 w-7 h-7 bg-pink-500 rounded-full flex items-center justify-center text-white shadow-md">
              ✓
            </div>
          )}

          <div className="relative z-10">
            <h3 className="text-2xl font-extrabold text-white tracking-widest">ANIME</h3>
          </div>
        </div>
      </div>
    </div>
  )
}
