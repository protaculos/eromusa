'use client'

import React, { useState, useEffect } from 'react'
import ImageUpload from './ImageUpload'
import Carousel from './Carousel'
import FilterSelector from './FilterSelector'
import { useRole } from '../hooks/useRole'
import AdminCarouselManager from './AdminCarouselManager'
import { supabase } from '@/lib/supabase'
import AuthModal from './AuthModal'
import Link from 'next/link'

export default function StyleSelector() {
  const [selectedStyle, setSelectedStyle] = useState('Anime')
  const [selectedFilter, setSelectedFilter] = useState('Boquete')
  const [selectedMedia, setSelectedMedia] = useState<{ videoUrl: string; thumbUrl: string } | null>(null)
  const [hasImage, setHasImage] = useState<boolean>(false)

  const [user, setUser] = useState<any>(null)
  const [credits, setCredits] = useState<number | null>(null)
  const [modalMode, setModalMode] = useState<'login' | 'signup' | null>(null)

  const { role, loading } = useRole()
  const [showAlert, setShowAlert] = useState(false)
  const [showInsufficientCreditsAlert, setShowInsufficientCreditsAlert] = useState(false)

  // Verifica se o usuário está logado e busca os créditos
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchCredits(session.user.id)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchCredits(session.user.id)
      } else {
        setCredits(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchCredits = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single()

      if (data) {
        setCredits(data.credits)
      }
    } catch (error) {
      console.error('Error fetching credits:', error)
    }
  }

  // Função para gerar vídeo
  const handleGenerateVideo = () => {
    if (!hasImage) {
      setShowAlert(true)

      // Esconde o alerta automaticamente após 3 segundos
      setTimeout(() => {
        setShowAlert(false)
      }, 3000)

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

    // Verifica se o usuário está logado
    if (!user) {
      setModalMode('login')
      return
    }

    // Verifica se o usuário tem créditos suficientes (30 créditos para gerar um vídeo)
    if (credits && credits < 30) {
      setShowInsufficientCreditsAlert(true)
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
            selectedStyle === 'Anime' ? 'border-pink-500' : 'border-gray-800 opacity-70 hover:opacity-100'
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
      <div className="mb-6 flex justify-center">
        <button
          onClick={handleGenerateVideo}
          className="py-4 px-4 rounded-full font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-[#FD5FC2] hover:opacity-90 text-white cursor-pointer"
        >
          {user ? (
            <>
              <span>Criar Vídeo</span>
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>30</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Gerar Vídeo</span>
            </>
          )}
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

      {/* Alerta de créditos insuficientes */}
      {showInsufficientCreditsAlert && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-3">Créditos Insuficientes</h3>
            <p className="text-gray-400 text-sm mb-6">Você precisa de 30 créditos para criar um vídeo.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowInsufficientCreditsAlert(false)}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition text-sm font-medium"
              >
                Cancelar
              </button>
              <Link
                href="/creditos"
                onClick={() => setShowInsufficientCreditsAlert(false)}
                className="flex-1 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl transition text-sm font-medium"
              >
                Adquirir Créditos
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Modal de autenticação */}
      {modalMode && (
        <AuthModal
          isOpen={modalMode !== null}
          onClose={() => setModalMode(null)}
          mode={modalMode}
        />
      )}
    </div>
  )
}
