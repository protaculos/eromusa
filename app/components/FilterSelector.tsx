'use client'

import React, { useRef } from 'react'

interface FilterSelectorProps {
  selectedFilter: string
  onFilterChange: (filter: string) => void
}

const filters = ['Boquete', 'Espanhola', 'Gozo na Boca']

export default function FilterSelector({ selectedFilter, onFilterChange }: FilterSelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <div className="w-full relative mb-6">
      <div
        ref={scrollRef}
        className="flex items-center space-x-3 overflow-x-auto scrollbar-hide py-1 px-1 justify-start md:justify-center"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {filters.map((filter) => {
          const isSelected = selectedFilter === filter
          return (
            <button
              key={filter}
              onClick={() => onFilterChange(filter)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-[#2A2A2A] text-white font-bold border border-gray-600 shadow-md'
                  : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {filter}
            </button>
          )
        })}
      </div>
    </div>
  )
}
