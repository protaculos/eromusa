'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Header from '../components/Header'
import GenderSelector from '../components/GenderSelector'
import { supabase } from '@/lib/supabase'

// Tempo de expiração: 72 horas em segundos
const EXPIRATION_TIME = 72 * 60 * 60

// Função para formatar segundos em HHh MMm SSs
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${h}h ${m}m ${s}s`
}

export default function GaleriaPage() {
  const [user, setUser] = useState<any>(null)
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [modalVideo, setModalVideo] = useState<any>(null)
  const [confirmAction, setConfirmAction] = useState<{ action: 'delete' | 'download'; video: any } | null>(null)
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: number }>({})
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({})

  // Atualiza o tempo restante para cada vídeo
  useEffect(() => {
    const interval = setInterval(() => {
      if (videos.length > 0) {
        const newTimeLeft: { [key: string]: number } = {}
        videos.forEach(video => {
          const createdAt = new Date(video.created_at).getTime()
          const now = Date.now()
          const elapsed = Math.floor((now - createdAt) / 1000)
          const remaining = Math.max(0, EXPIRATION_TIME - elapsed)
          newTimeLeft[video.id] = remaining
        })
        setTimeLeft(newTimeLeft)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [videos])

  // Verifica se algum vídeo expirou e exclui automaticamente
  useEffect(() => {
    const checkExpiredVideos = async () => {
      if (!user) return

      const expiredVideos = videos.filter(video => {
        const remaining = timeLeft[video.id]
        return remaining !== undefined && remaining <= 0
      })

      if (expiredVideos.length > 0) {
        for (const video of expiredVideos) {
          try {
            await supabase
              .from('videos')
              .delete()
              .eq('id', video.id)
            setVideos(prev => prev.filter(v => v.id !== video.id))
          } catch (error) {
            console.error('Erro ao excluir vídeo expirado:', error)
          }
        }
      }
    }

    checkExpiredVideos()
  }, [videos, timeLeft, user])

  useEffect(() => {
    const checkUserAndFetchVideos = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false })

        if (!error && data) {
          setVideos(data)
        }
      }
      setLoading(false)
    }

    checkUserAndFetchVideos()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        const { data } = await supabase
          .from('videos')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false })

        if (data) setVideos(data)
      } else {
        setVideos([])
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleDeleteVideo = async (videoId: string) => {
    setDeletingId(videoId)

    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId)

      if (error) throw error

      setVideos((prev) => prev.filter((v) => v.id !== videoId))
      setModalVideo(null)
    } catch (error: any) {
      console.error('Erro ao excluir vídeo:', error.message)
    } finally {
      setDeletingId(null)
    }
  }

  const handleDownloadVideo = async (video: any) => {
    try {
      // Primeiro baixa o arquivo como blob para garantir o download
      const response = await fetch(video.video_url)
      const blob = await response.blob()

      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `video-${video.id}.mp4`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Libera a URL temporária
      setTimeout(() => URL.revokeObjectURL(link.href), 100)

      // Mostra alerta de sucesso
      alert(`Vídeo ${video.id} baixado com sucesso! Verifique sua pasta de downloads.`)
    } catch (error: any) {
      console.error('Erro ao baixar vídeo:', error)
      // Fallback: tenta download direto
      const link = document.createElement('a')
      link.href = video.video_url
      link.download = `video-${video.id}.mp4`
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Mostra alerta de erro
      alert(`Erro ao baixar o vídeo ${video.id}. Tente novamente.`)
    }
  }

  const handleConfirm = () => {
    if (!confirmAction) return

    if (confirmAction.action === 'delete') {
      handleDeleteVideo(confirmAction.video.id)
    } else if (confirmAction.action === 'download') {
      handleDownloadVideo(confirmAction.video)
    }

    setConfirmAction(null)
  }

  const handleVideoClick = (video: any) => {
    setModalVideo(video)
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col justify-between">
      <div>
        <Header />

        <main className="max-w-xl mx-auto px-4 pt-8 pb-4 text-center">
          <GenderSelector />
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-6">
            <div className="text-white">SUAS CRIAÇÕES</div>
            <div className="text-[#FD5FC2]">GALERIA DE VÍDEOS</div>
          </h1>

          {loading ? (
            <div className="bg-[#1A1A1A] border border-gray-800 rounded-3xl p-12 text-center text-gray-400">
              <p className="text-sm">Carregando...</p>
            </div>
          ) : !user ? (
            <div className="bg-[#1A1A1A] border border-gray-800 rounded-3xl p-12 text-center space-y-4">
              <p className="text-sm text-gray-300">Você precisa entrar na sua conta para ver os vídeos que criou.</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="bg-[#1A1A1A] border border-gray-800 rounded-3xl p-12 text-center space-y-6">
              <p className="text-sm text-gray-400">Você ainda não gerou nenhum vídeo.</p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl transition shadow-lg shadow-pink-500/30"
              >
                Criar um vídeo agora
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {videos.map((video) => {
                const remaining = timeLeft[video.id] || EXPIRATION_TIME
                const isExpired = remaining <= 0

                return (
                  <div
                    key={video.id}
                    className="relative aspect-square rounded-3xl overflow-hidden border-2 border-gray-800 cursor-pointer group"
                    onClick={() => !isExpired && handleVideoClick(video)}
                  >
                    <video
                      ref={(el) => { videoRefs.current[video.id] = el }}
                      src={video.video_url}
                      muted
                      loop
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Overlay de expirado */}
                    {isExpired && (
                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
                        <span className="text-white font-bold text-sm">EXPIRADO</span>
                      </div>
                    )}

                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>

      {/* Modal de Vídeo */}
      {modalVideo && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => {
            const video = document.getElementById(`modal-video-${modalVideo.id}`) as HTMLVideoElement;
            if (video) {
              video.pause()
              video.currentTime = 0
            }
            setModalVideo(null)
          }}
        >
          <div
            className="relative bg-[#1A1A1A] border border-gray-800 rounded-3xl w-full max-w-md mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setModalVideo(null)}
              className="absolute top-3 right-3 z-10 w-6 h-6 bg-gray-800 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Vídeo 1:1 */}
            <div className="relative aspect-square bg-black">
              <video
                id={`modal-video-${modalVideo.id}`}
                src={modalVideo.video_url}
                muted
                loop
                playsInline
                autoPlay
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            {/* Cronômetro */}
            <div className="p-3 text-center text-xs text-gray-400">
              Expira em {formatTime(timeLeft[modalVideo.id] || EXPIRATION_TIME)}
            </div>

            {/* Botões */}
            <div className="flex p-3 gap-3">
              {/* Botão Deletar */}
              <button
                onClick={() => setConfirmAction({ action: 'delete', video: modalVideo })}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 border border-red-500/40 text-red-300 hover:text-white hover:bg-red-500/30 rounded-xl transition text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Deletar</span>
              </button>

              {/* Botão Baixar */}
              <button
                onClick={() => setConfirmAction({ action: 'download', video: modalVideo })}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl transition text-sm font-medium shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12V2m0 0l-4 4m4-4l4 4" />
                </svg>
                <span>Baixar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup de Confirmação */}
      {confirmAction && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-3">
              {confirmAction.action === 'delete'
                ? 'Confirmar exclusão'
                : 'Baixar vídeo'}
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              {confirmAction.action === 'delete'
                ? 'Tem certeza que deseja excluir este vídeo? Esta ação não pode ser desfeita.'
                : 'Deseja baixar este vídeo para seu computador?'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 px-4 py-2 rounded-xl transition text-sm font-medium ${
                  confirmAction.action === 'delete'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-pink-500 hover:bg-pink-600 text-white'
                }`}
              >
                {confirmAction.action === 'delete' ? 'Excluir' : 'Baixar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}