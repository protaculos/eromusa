'use client'

import React, { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'login' | 'signup'
}

export default function AuthModal({ isOpen, onClose, mode }: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [internalMode, setInternalMode] = useState(mode)

  useEffect(() => {
    setInternalMode(mode)
  }, [mode])

  // Limpar campos quando o modal abre
  useEffect(() => {
    if (isOpen) {
      setEmail('')
      setPassword('')
      setMessage(null)
    }
  }, [isOpen])

  const isSignup = internalMode === 'signup'
  const isClosingByPopState = useRef(false)

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  useEffect(() => {
    if (isOpen) {
      isClosingByPopState.current = false
      history.pushState({ modalOpen: true }, '')

      const handlePopState = () => {
        isClosingByPopState.current = true
        onClose()
      }
      window.addEventListener('popstate', handlePopState)
      return () => window.removeEventListener('popstate', handlePopState)
    }
  }, [isOpen, onClose])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (isSignup) {
        // Verificar se o email já existe antes de criar a conta
        const { data: emailExists } = await supabase
          .rpc('check_email_exists', { check_email: email })

        if (emailExists) {
          throw new Error('Já existe uma conta com este email. Clique em "Entrar" para acessar.')
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) {
          if (error.message.includes('already registered') || error.message.includes('already been registered')) {
            throw new Error('Já existe uma conta com este email. Clique em "Entrar" para acessar.')
          }
          throw error
        }

        setMessage({ type: 'success', text: 'Conta criada! Verifique seu email para confirmar.' })
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Email não cadastrado ou senha incorreta.')
          }
          throw error
        }
        setMessage({ type: 'success', text: 'Login realizado com sucesso!' })
        setTimeout(() => onClose(), 1500)
      }
    } catch (error: any) {
      // Tratamento de erros para evitar mensagens técnicas (como o "coerce result")
      let friendlyMessage = error.message || 'Ocorreu um erro. Tente novamente.'

      if (friendlyMessage.includes('Cannot coerce the result to a single JSON object')) {
        friendlyMessage = 'Erro ao verificar sua conta. Tente novamente.'
      }

      setMessage({ type: 'error', text: friendlyMessage })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={handleBackdropClick}>
      <div
        className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="p-8 pb-0 text-center">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">
            {isSignup ? 'CRIAR CONTA' : 'ENTRAR'}
          </h2>
          <p className="text-gray-400 text-sm md:text-base">
            {isSignup
              ? 'Junte-se ao EroMusa e comece a criar'
              : 'Bem-vindo de volta ao EroMusa'}
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleAuth} className="p-8 space-y-6">
          <div className="space-y-4">
            {/* Email Input */}
            <div className="relative">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu endereço de email"
                className="w-full py-3 px-4 pl-11 bg-gray-800/50 border border-gray-600 text-white placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition"
              />
              <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2.22 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                className="w-full py-3 px-4 pl-11 bg-gray-800/50 border border-gray-600 text-white placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition"
              />
              <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          {/* Status Message */}
          {message && (
            <div className={`p-3 rounded-xl text-sm text-center animate-in slide-in-from-top-2 duration-200 ${
              message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {message.text}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018 0D12 12a8 8 0 018 0v0M12 12v8m0 0l-3-3m3 3l3-3"></path>
              </svg>
            ) : (
              <span>{isSignup ? 'Criar minha conta' : 'Entrar agora'}</span>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="p-8 pt-0 text-center">
          <p className="text-gray-400 text-sm">
            {isSignup ? 'Já tem uma conta?' : "Não tem uma conta?"}
            <button
              onClick={() => setInternalMode(isSignup ? 'login' : 'signup')}
              className="ml-2 text-pink-500 hover:text-pink-400 font-medium transition"
            >
              {isSignup ? 'Faça login' : 'Crie uma conta'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
