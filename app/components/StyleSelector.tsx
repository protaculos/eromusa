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
  const [hasImage, setHasImage] = useState<boolean>(false)

  const { role, loading } = useRole()
  const [showAlert, setShowAlert] = useState(false)

  // Função para gerar vídeo
  const handleGenerateVideo = () => {
    if (!hasImage) {
      setShowAlert(true)
      // Adiciona uma tremida no modal de upload de foto
      const uploadModal = document.querySelector('.relative.aspect-square.rounded-3xl') as HTMLElement
      if (uploadModal) {
        uploadModal.classList.add('animate-shake')
        setTimeout(() => {
          uploadModal.classList.remove('animate-shake')
        }, 1000)
      }
      return
    }

    // Lógica para gerar vídeo (você pode implementar aqui)
    alert('Gerando vídeo com a imagem selecionada!')
  }

  // Função para lidar com o upload da imagem original
  const handleImageUpload = async (file: File | null) => {

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Imagem enviada com sucesso:', data.url);
        // Aqui você pode armazenar o URL da imagem em um estado ou usá-lo diretamente
        // Por exemplo: setImageUrl(data.url)
      } else {
        console.error('Erro ao enviar imagem:', data.error);
      }
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
    }
  };

  return (
    <div className="max-w-xl mx-auto mb-8 px-4">
      <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4 mb-6">
        {/* MODAL ESQUERDA: Upload de Foto (Recebe a thumbnail do carrossel como fundo padrão) */}
        <ImageUpload
          currentCarouselImage={selectedMedia?.thumbUrl || ''}
          onImageUpload={(file) => {
            handleImageUpload(file)
            setHasImage(!!file)
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

      {/* Botão Gerar Vídeo abaixo dos modais principais */}
      <div className="mb-6">
        <button
          onClick={handleGenerateVideo}
          className="w-full py-4 rounded-full font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-[#FD5FC2] hover:opacity-90 text-white shadow-lg shadow-pink-500/30 cursor-pointer"
        >
          Gerar Vídeo
        </button>
      </div>

      {/* Alerta para quando não há imagem */}
      {showAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#FD5FC2] text-black font-bold text-sm shadow-xl shadow-black/60 animate-slide-down">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m-3-3l-3 3m3-3V8a1 1 0 012 0v4" />
          </svg>
          <span>Envie uma foto primeiro para gerar o vídeo!</span>
          <button
            onClick={() => setShowAlert(false)}
            className="hover:opacity-80 transition-opacity"
            aria-label="Fechar alerta"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

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
