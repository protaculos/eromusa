'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import AuthModal from './AuthModal'
import { supabase } from '@/lib/supabase'

export default function Header() {
  const [modalMode, setModalMode] = useState<'login' | 'signup' | null>(null)
  const [user, setUser] = useState<any>(null)
  const [credits, setCredits] = useState<number | null>(null)
  const activeChannelRef = useRef<any>(null)

  useEffect(() => {
    const setupRealtime = async (userId: string) => {
      // Busca inicial
      const { data } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single()

      if (data) setCredits(data.credits)

      // Remove canal anterior se existir
      if (activeChannelRef.current) {
        supabase.removeChannel(activeChannelRef.current)
        activeChannelRef.current = null
      }

      // Cria novo canal antes do subscribe
      activeChannelRef.current = supabase
        .channel(`credits-realtime-${userId}-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${userId}`,
          },
          (payload) => {
            setCredits(payload.new.credits)
          }
        )
        .subscribe()
    }

    // 1. Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setupRealtime(session.user.id)
      }
    })

    // 2. Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setupRealtime(session.user.id)
      } else {
        setCredits(null)
        if (activeChannelRef.current) {
          supabase.removeChannel(activeChannelRef.current)
          activeChannelRef.current = null
        }
      }
    })

    return () => {
      subscription.unsubscribe()
      if (activeChannelRef.current) {
        supabase.removeChannel(activeChannelRef.current)
        activeChannelRef.current = null
      }
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#0D0D0D]/95 backdrop-blur-md border-b border-pink-500/20">
        <div className="max-w-xl mx-auto flex justify-between items-center p-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl md:text-3xl font-black tracking-wider text-white">ero<span className="text-pink-500">musa</span></span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Créditos Display */}
                <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-bold text-white">{credits ?? '...'}</span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-xs text-gray-400 hover:text-white transition"
                >
                  Sair
                </button>
              </div>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={() => setModalMode('login')}
                  className="px-5 py-1.5 text-sm border border-pink-500/50 text-white rounded-full hover:bg-pink-500/10 transition"
                >
                  Entrar
                </button>
                <button
                  onClick={() => setModalMode('signup')}
                  className="px-5 py-1.5 text-sm bg-pink-500 text-white font-medium rounded-full hover:bg-pink-600 transition shadow-lg shadow-pink-500/30"
                >
                  Criar Conta
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={modalMode !== null}
        onClose={() => setModalMode(null)}
        mode={modalMode || 'signup'}
      />
    </>
  )
}
