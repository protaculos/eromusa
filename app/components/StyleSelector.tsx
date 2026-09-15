'use client'

import React, { useState } from 'react'
import ImageUpload from './ImageUpload'
import Carousel from './Carousel'
import FilterSelector from './FilterSelector'
import { useRole } from '../hooks/useRole'
import AdminCarouselManager from './AdminCarouselManager'

export default function StyleSelector() {
  const [selectedStyle, setSelectedStyle] = useState('Anime')
  const [selectedFilter, setSelectedFilter] = useState('Boquete')
  const [selectedMedia, setSelectedMedia] = useState<{ videoUrl: string; thumbUrl: string } | null>(null)

  const { role, loading } = useRole()

  return (
    <div className="max-w-xl mx-auto mb-8 px-4">
      <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4 mb-6">
        {/* MODAL ESQUERDA: Upload de Foto (Recebe a thumbnail do carrossel como fundo padrão) */}
        <ImageUpload
          currentCarouselImage={selectedMedia?.thumbUrl || ''}
          onImageUpload={(file) => {
            // Aqui você pode implementar a lógica para enviar a imagem original para a API
            // Por exemplo:
            // if (file) {
            //   uploadImageToAPI(file)
            // }
          }}
        />

        {/* MODAL DIREITA: O vídeo selecionado no carrossel roda em loop aqui */}
        <div
          onClick={() => setSelectedStyle('Anime')}
          className={`relative aspect-square rounded-3xl overflow-hidden border-2 cursor-pointer transition-all duration-300 group ${
            selectedStyle === 'Anime' ? 'border-pink-500 shadow-xl shadow-pink-500/20' : 'border-gray-800 opacity-70 hover:opacity-100'
          }`}
        >
          <div className="w-full h-full bg-black relative flex flex-col justify-end p-0">
            {selectedMedia?.videoUrl ? (
              <video
                src={selectedMedia.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
            ) : (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={selectedMedia?.thumbUrl ? { backgroundImage: `url("${selectedMedia.thumbUrl}")` } : {}}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
          </div>
        </div>
      </div>

      <FilterSelector selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} />

      {!loading && role === 'adm' ? (
        <AdminCarouselManager
          categorySlug={selectedFilter.toLowerCase().replace(/\s+/g, '-')}
          onUpdate={() => {}}
        />
      ) : null}

      <Carousel onImageSelect={setSelectedMedia} filter={selectedFilter} />
    </div>
  )
}
