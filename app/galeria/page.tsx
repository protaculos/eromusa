"use client"

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

export default function GaleriaPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
  const [user, setUser] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalVideo, setModalVideo] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)
  const videoRefs = useRef({})

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    checkUser()

    const fetchVideos = async () => {
      if (!user) return

      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Erro ao buscar vídeos:', error)
        } else {
          setVideos(data || [])
        }
      } catch (err) {
        console.error('Erro ao buscar vídeos:', err)
      } finally {
        setLoading(false)
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await checkUser()
        if (session?.user) {
          await fetchVideos()
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setVideos([])
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleVideoClick = (video) => {
    setModalVideo(video)
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col justify-between">
      <div>

        <main className="max-w-xl mx-auto px-4 pt-8 pb-4 text-center">
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
              {videos.map((video) => (
                <div key={video.id} className="relative aspect-square rounded-3xl overflow-hidden border-2 border-gray-800 cursor-pointer group">
                  {video.video_url && video.video_url.startsWith('processing') ? (
                    <div className="relative w-full h-full">
                      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${video.thumbnail_url}')` }} />
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-3 text-center">
                        <svg className="animate-spin h-7 w-7 text-[#FD5FC2] mb-2.5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span className="text-[13px] font-bold text-white tracking-wide leading-tight mb-1">
                          Gerando vídeo...
                        </span>
                        <span className="text-[10px] text-gray-300 leading-tight">
                          Aguarde 2-5 min
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <div className="relative w-full h-full">
                        <video
                          ref={(el) => { videoRefs.current[video.id] = el }}
                          src={video.video_url}
                          muted
                          loop
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Erro ao carregar vídeo no grid:', e, video.video_url)
                          }}
                        />
                        <img
                          src={video.thumbnail_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{ backgroundColor: 'black', zIndex: 0 }}
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                          }}
                        />
                      </div>
                      <img
                        src={video.thumbnail_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ backgroundColor: 'black', zIndex: 0 }}
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                        }}
                      />
                      {video.is_expired && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
                          <span className="text-white font-bold text-sm">EXPIRADO</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Modal de Vídeo */}
        {modalVideo && (
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => {
              setModalVideo(null)
            }}
          >
            <div
              className="relative w-full max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-full">
                <video
                  id={`modal-video-${modalVideo.id}`}
                  src={modalVideo.video_url}
                  muted
                  controls
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Erro ao carregar vídeo:', e, modalVideo.video_url)
                  }}
                />
                <img
                  src={modalVideo.thumbnail_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ backgroundColor: 'black', zIndex: 0 }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                  }}
                />
              </div>
              <img
                src={modalVideo.thumbnail_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ backgroundColor: 'black', zIndex: 0 }}
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                }}
              />
              {modalVideo.is_expired && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
                  <span className="text-white font-bold text-2xl">EXPIRADO</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}