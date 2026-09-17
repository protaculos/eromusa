"use client"

import { useState, useEffect, useRef } from 'react'
import Header from '../components/Header'
import GenderSelector from '../components/GenderSelector'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

// Vídeos de teste para demonstração
const TEST_VIDEOS = [
 {
 id: 'test-1',
 user_id: 'test-user',
 video_url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-in-white-sweater-smiling-at-camera-4163-large.mp4',
 thumbnail_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
 created_at: new Date().toISOString(),
 is_expired: false
 },
 {
 id: 'test-2',
 user_id: 'test-user',
 video_url: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-sunbathing-in-a-pool-40016-large.mp4',
 thumbnail_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80',
 created_at: new Date(Date.now() - 86400000).toISOString(),
 is_expired: false
 },
 {
 id: 'test-3',
 user_id: 'test-user',
 video_url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-waving-goodbye-on-a-city-street-41636-large.mp4',
 thumbnail_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
 created_at: new Date(Date.now() - 172800000).toISOString(),
 is_expired: false
 }
];

export default function GaleriaPage() {
  const [user, setUser] = useState<any>(null)
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVideo, setModalVideo] = useState<any>(null)
  const [confirmAction, setConfirmAction] = useState(null)
  const videoRefs = useRef<any>({})

  useEffect(() => {
    let isMounted = true;

    const initializeGallery = async () => {
      try {
        // Verifica o usuário e atualiza o estado
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Erro ao verificar usuário:', error);
          if (isMounted) {
            setUser(null);
            setVideos([]);
          }
          return;
        }

        if (isMounted) {
          setUser(user);
        }

        // Se o usuário estiver logado, busca os vídeos
        if (user) {
          const { data: videosData, error: videosError } = await supabase
            .from('videos')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (videosError) {
            console.error('Erro ao buscar vídeos:', videosError);
            if (isMounted) {
              setVideos(TEST_VIDEOS); // Usar vídeos de teste se houver erro
            }
          } else if (isMounted) {
            // Se encontrou vídeos, use. Se não tiver nenhum, use os de teste para demonstração!
            setVideos(videosData && videosData.length > 0 ? videosData : TEST_VIDEOS);
          }
        } else if (isMounted) {
          // Se não estiver logado, por enquanto mostra os de teste para você validar o layout!
          setVideos(TEST_VIDEOS);
        }
      } catch (err) {
        console.error('Erro geral na galeria:', err);
        if (isMounted) {
          setUser(null);
          setVideos(TEST_VIDEOS); // Test vídeos no fallback
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeGallery();

    // Escuta mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user && isMounted) {
          setUser(session.user);
          const { data, error } = await supabase
            .from('videos')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });
          if (!error && isMounted) {
            setVideos(data || []);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        if (isMounted) {
          setUser(null);
          setVideos([]);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
                    <div className="relative w-full h-full" onClick={() => handleVideoClick(video)}>
                      <video
                        ref={(el) => { videoRefs.current[video.id] = el }}
                        src={video.video_url}
                        poster={video.thumbnail_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                        muted
                        loop
                        playsInline
                        autoPlay
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Erro ao carregar vídeo no grid:', e, video.video_url);
                          if (!video.video_url || video.video_url.startsWith('processing')) {
                            return (
                              <div className="relative w-full h-full">
                                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${video.thumbnail_url}')` }} />
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-3 text-center">
                                  <span className="text-[13px] font-bold text-white tracking-wide leading-tight mb-1">
                                    Vídeo indisponível
                                  </span>
                                  <span className="text-[10px] text-gray-300 leading-tight">
                                    Tente novamente mais tarde
                                  </span>
                                </div>
                              </div>
                            );
                          }
                        }}
                      />
                      {video.is_expired && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10 pointer-events-none">
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
              className="relative w-full max-w-4xl max-h-[90vh] bg-black rounded-lg overflow-hidden flex items-center justify-center p-0 m-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  id={`modal-video-${modalVideo.id}`}
                  src={modalVideo.video_url}
                  poster={modalVideo.thumbnail_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  controls
                  playsInline
                  autoPlay
                  className="max-w-full max-h-[85vh] object-contain"
                  onError={(e) => {
                    console.error('Erro ao carregar vídeo:', e, modalVideo.video_url);
                          if (!modalVideo.video_url || modalVideo.video_url.startsWith('processing')) {
                            return (
                              <div className="relative w-full h-full">
                                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${modalVideo.thumbnail_url}')` }} />
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-3 text-center">
                                  <span className="text-[13px] font-bold text-white tracking-wide leading-tight mb-1">
                                    Vídeo indisponível
                                  </span>
                                  <span className="text-[10px] text-gray-300 leading-tight">
                                    Tente novamente mais tarde
                                  </span>
                                </div>
                              </div>
                            );
                          }
                  }}
                />
              </div>
              {modalVideo.is_expired && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10 pointer-events-none">
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