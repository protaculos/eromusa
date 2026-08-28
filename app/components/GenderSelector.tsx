import React, { useState } from 'react'

export default function GenderSelector() {
  const [selectedGender, setSelectedGender] = useState('Female')

  const genders = [
    { name: 'Female', icon: '♀' },
    { name: 'Male', icon: '♂' },
    { name: 'Trans', icon: '⚧' },
  ]

  return (
    <div className="flex justify-center space-x-3 mb-8">
      {genders.map((gender) => (
        <button
          key={gender.name}
          onClick={() => setSelectedGender(gender.name)}
          className={`flex items-center space-x-1.5 px-5 py-2 rounded-full border transition-all duration-200 ${
            selectedGender === gender.name
              ? 'bg-pink-500/20 border-pink-500 text-white'
              : 'bg-black/30 border-gray-700 text-gray-300 hover:bg-black/40'
          }`}
        >
          <span className="text-sm">{gender.icon}</span>
          <span className="text-sm font-medium">{gender.name}</span>
        </button>
      ))}
    </div>
  )
}
