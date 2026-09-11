'use client'

import React, { useState, useRef, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

interface CarouselProps {
  onImageSelect: (item: { videoUrl: string; thumbUrl: string }) => void
  filter: string
}

export default function Carousel({ onImageSelect, filter }: CarouselProps) {
  const [items, setItems] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDown, setIsDown] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeftStart, setScrollLeftStart] = useState(0)
  const [wasDragged, setWasDragged] = useState(false)

  useEffect(() => {
    async function fetchItems() {
      setLoading(true)
      try {
        const { data: category } = await supabase
          .from('carousel_categories')
          .select('id')
          .eq('name', filter)
          .single()

        if (category) {
          const { data: itemsData } = await supabase
            .from('carousel_items')
            .select('*')
            .eq('category_id', category.id)
            .order('order', { ascending: true })

          if (itemsData) {
            setItems(itemsData)
            if (itemsData.length > 0) {
              onImageSelect({
                videoUrl: itemsData[0].video_url,
                thumbUrl: itemsData[0].thumbnail_url
              })
            }
          }
        }
      } catch (error) {
        console.error('Error fetching carousel items:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchItems()
  }, [filter, supabase, onImageSelect])

  useEffect(() => {
    setCurrentIndex(0)
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' })
    }
  }, [filter])

  const handleImageClick = (item: any, index: number) => {
    if (wasDragged) {
      setWasDragged(false)
      return
    }
    setCurrentIndex(index)
    onImageSelect({ videoUrl: item.video_url, thumbUrl: item.thumbnail_url })
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const container = scrollRef.current
      const scrollAmount = 120
      const newScrollLeft = direction === 'left'
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount
      container.scrollTo({ left: newScrollLeft, behavior: 'smooth' })
    }
  }

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDown(true)
    setWasDragged(false)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeftStart(scrollRef.current.scrollLeft)
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = x - startX
    scrollRef.current.scrollLeft = scrollLeftStart - walk
    if (Math.abs(walk) > 5) setWasDragged(true)
  }

  const onMouseUp = () => setIsDown(false)

  const onTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return
    setIsDown(true)
    setWasDragged(false)
    setStartX(e.touches[0].clientX - scrollRef.current.offsetLeft)
    setScrollLeftStart(scrollRef.current.scrollLeft)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDown || !scrollRef.current) return
    const x = e.touches[0].clientX - scrollRef.current.offsetLeft
    const walk = x - startX
    scrollRef.current.scrollLeft = scrollLeftStart - walk
    if (Math.abs(walk) > 5) setWasDragged(true)
  }

  const onTouchEnd = () => setIsDown(false)

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDown(false)
    document.addEventListener('mouseup', handleGlobalMouseUp)
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [])

  if (loading) return <div className="text-center text-gray-500 text-sm py-4">Carregando mídias...</div>

  return (
    <div className="relative mb-8">
      <button
        onClick={() => scroll('left')}
        className="absolute left-[-2.5rem] top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black/80 border border-pink-500/30 rounded-full items-center justify-center text-pink-500 hover:bg-pink-500 hover:text-white transition shadow-lg hidden md:flex"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={() => scroll('right')}
        className="absolute right-[-2.5rem] top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black/80 border border-pink-500/30 rounded-full items-center justify-center text-pink-500 hover:bg-pink-500 hover:text-white transition shadow-lg hidden md:flex"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div
        ref={scrollRef}
        className={`flex space-x-3 overflow-x-auto scrollbar-hide px-0 py-3 select-none ${isDown ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            onClick={() => handleImageClick(item, index)}
            className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-200 ${
              index === currentIndex
                ? 'border-pink-500 opacity-100 ring-2 ring-pink-500/50'
                : 'border-gray-800 hover:border-pink-500/50 opacity-70 hover:opacity-100'
            }`}
          >
            <div
              className="w-full h-full bg-cover bg-center pointer-events-none"
              style={{ backgroundImage: `url(${item.thumbnail_url})` }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
