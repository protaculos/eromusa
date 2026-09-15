'use client'

import React, { useState, useRef, useMemo, useEffect } from 'react'
import Header from '../components/Header'
import GenderSelector from '../components/GenderSelector'
import { supabase } from '@/lib/supabase'

interface CreditPackage {
  id: string
  credits: number
  price: number
  currency: 'USD' | 'BRL'
  popular?: boolean
  bestValue?: boolean
}

const PACKAGES: CreditPackage[] = [
  // Pacotes em Real (BRL)
  { id: 'brl9.90', credits: 60, price: 9.90, currency: 'BRL' },
  { id: 'brl29.90', credits: 300, price: 29.90, currency: 'BRL', popular: true },
  { id: 'brl49.90', credits: 600, price: 49.90, currency: 'BRL' },
]


const formatPrice = (n: number) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function CreditosPage() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
  const paymentSectionRef = useRef<HTMLDivElement>(null)
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const selectedPkg = useMemo(
    () => PACKAGES.find((p) => p.id === selectedPackage) ?? null,
    [selectedPackage]
  )

  const currency = { code: 'BRL', symbol: 'R$', label: 'Real' }

  const handleSelectPackage = (pkgId: string) => {
    setSelectedPackage(pkgId)
    setTimeout(() => {
      paymentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
  }

  const [user, setUser] = useState<any>(null)
  const [loadingCheckout, setLoadingCheckout] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])


  const handleFinalize = async () => {
    if (!selectedPkg || !selectedPayment) return

    if (!user) {
      alert('Por favor, faça login ou crie uma conta para prosseguir com o pagamento.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    try {
      setLoadingCheckout(true)

      // Cria a nova aba imediatamente com a URL de destino após obter da API
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: selectedPkg.price,
          currency: currencyCode,
          credits: selectedPkg.credits,
          email: user.email,
          userId: user.id,
          payment_method: selectedPayment
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar sessão de pagamento')
      }

      if (data.checkout_url) {
        // Abre o checkout da Vexutopia em uma nova aba
        window.open(data.checkout_url, '_blank', 'noopener,noreferrer')
      } else {
        throw new Error('URL de checkout não retornada')
      }
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Erro ao processar pagamento. Tente novamente.')
    } finally {
      setLoadingCheckout(false)
    }
  }

    // Handler para quando alguém tenta interagir com o método de pagamento sem pacote
  const handleLockedPaymentClick = () => {
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current)
    }
    setShowAlertId('locked-payment')
    alertTimeoutRef.current = setTimeout(() => {
      setShowAlertId(null)
    }, 3000)
    // Faz scroll até o passo 1 (pacotes de crédito) para direcionar o cliente
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 300)
  }

  // Handler de clique nos métodos de pagamento
  const handlePaymentClick = (method: string) => {
    if (!selectedPackage) {
      handleLockedPaymentClick()
      return
    }
    setSelectedPayment(method)
  }

  const [showAlertId, setShowAlertId] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col overflow-x-hidden">
      <style jsx>{`
        @keyframes slidedown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down { animation: slidedown 0.3s ease-out; }
      `}</style>
      <div className="relative">
        <Header />

        <main className="max-w-xl mx-auto px-4 pt-8 pb-24 text-center">
          <GenderSelector />

          {/* ALERTA TEMPORÁRIO NO TOPO */}
          {showAlertId === 'locked-payment' && (
            <div
              className="fixed top-20 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#FD5FC2] text-black font-bold text-sm shadow-xl shadow-black/60 animate-slide-down"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m-3-3l-3 3m3-3V8a1 1 0 112 0v4" />
              </svg>
              <span>Selecione um pacote de créditos para desbloquear o pagamento.</span>
              <button
                onClick={() => setShowAlertId(null)}
                className="hover:opacity-80 transition-opacity"
                aria-label="Fechar alerta"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* TÍTULO */}
          <div className="relative mb-8">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
              <span className="block text-white opacity-90">COMPRE CRÉDITOS</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FD5FC2] via-pink-400 to-[#FD5FC2]">
                COM FACILIDADE
              </span>
            </h1>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-16 h-1 bg-pink-500 rounded-full" />
          </div>


          {/* PASSO 1: LISTA DE PACOTES DE CRÉDITOS */}
          <div className="mb-12 text-left">
            <div className="flex items-center gap-2 mb-5">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-pink-500 text-white font-black text-xs">1</span>
              <h2 className="text-lg md:text-xl font-bold tracking-tight text-white">
                Escolha a quantidade de créditos
              </h2>
            </div>

            <div className="bg-[#141414] border border-gray-800 rounded-3xl divide-y divide-gray-800 overflow-hidden">
              {PACKAGES.map((pkg) => {
                const isSelected = selectedPackage === pkg.id
                const perCredit = pkg.price / pkg.credits
                return (
                  <button
                    key={pkg.id}
                    onClick={() => handleSelectPackage(pkg.id)}
                    className={`w-full flex items-center gap-4 px-4 md:px-5 py-4 transition-colors text-left ${
                      isSelected
                        ? 'bg-pink-500/10'
                        : 'hover:bg-[#1a1a1a]'
                    }`}
                  >
                    {/* Radio indicator */}
                    <span
                      className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? 'border-pink-500' : 'border-gray-600'
                      }`}
                    >
                      {isSelected && (
                        <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                      )}
                    </span>

                    {/* Crédito + preço por crédito */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-black text-lg tracking-tight">
                          {pkg.credits.toLocaleString('pt-BR')} créditos
                        </span>
                        {pkg.popular && (
                          <span className="text-[10px] font-black tracking-widest uppercase text-pink-300 bg-pink-500/15 px-2 py-0.5 rounded-full">
                            Popular
                          </span>
                        )}
                        {pkg.bestValue && (
                          <span className="text-[10px] font-black tracking-widest uppercase text-yellow-300 bg-yellow-500/15 px-2 py-0.5 rounded-full">
                            Melhor Valor
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Crie {Math.floor(pkg.credits / 30)} vídeo{Math.floor(pkg.credits / 30) !== 1 ? 's' : ''}
                      </div>
                    </div>

                    {/* Preço */}
                    <div className="text-right">
                      <div className="text-white font-black text-lg md:text-xl tracking-tight whitespace-nowrap">
                        {currency.symbol} {formatPrice(pkg.price)}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {currency.symbol} {formatPrice(perCredit * 30)} / vídeo
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* PASSO 2: MÉTODO DE PAGAMENTO */}
          <div ref={paymentSectionRef} className="text-left scroll-mt-8">
            <div className="flex items-center gap-2 mb-5">
              <span
                className={`flex items-center justify-center w-7 h-7 rounded-full font-black text-xs transition-colors ${
                  selectedPackage ? 'bg-pink-500 text-white' : 'bg-gray-800 text-gray-500'
                }`}
              >
                2
              </span>
              <h2
                className={`text-lg md:text-xl font-bold tracking-tight transition-colors ${
                  selectedPackage ? 'text-white' : 'text-gray-500'
                }`}
              >
                Método de Pagamento
              </h2>
            </div>

            <div className="relative rounded-3xl bg-[#141414] border border-gray-800 transition-all duration-300">
              <div className="p-4 md:p-5 space-y-3">
                {/* PIX */}
                <PaymentOption
                  active={selectedPayment === 'pix'}
                  onClick={() => handlePaymentClick('pix')}
                  flag="🇧🇷"
                  title="PIX"
                  subtitle="Aprovação instantânea"
                  tag="Recomendado"
                />

                {/* Telegram Stars */}
                <PaymentOption
                  active={selectedPayment === 'stars'}
                  onClick={() => handlePaymentClick('stars')}
                  icon={<TelegramIcon />}
                  title="Telegram"
                  subtitle="Pagamento com cartão de crédito ou Stars"
                />

                {/* Criptomoeda */}
                <PaymentOption
                  active={selectedPayment === 'crypto'}
                  onClick={() => handlePaymentClick('crypto')}
                  icon={<CryptoIcon />}
                  title="Criptomoeda"
                  subtitle="BTC, ETH, USDT e mais"
                />
              </div>

              {/* RESUMO + BOTÃO */}
              <div className="px-4 md:px-5 pb-5">
                {selectedPkg && (
                  <div className="mb-4 p-4 rounded-2xl bg-[#0D0D0D] border border-gray-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-400">Resumo do pedido</div>
                      <div className="text-white font-bold text-sm">
                        {selectedPkg.credits.toLocaleString('pt-BR')} créditos
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Total</div>
                      <div className="text-pink-400 font-black text-base">
                        {currency.symbol} {formatPrice(selectedPkg.price)}
                      </div>
                    </div>
                  </div>
                )}

                <button
                  disabled={!selectedPackage || !selectedPayment || loadingCheckout}
                  onClick={handleFinalize}
                  className={`w-full py-4 rounded-full font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    selectedPackage && selectedPayment && !loadingCheckout
                      ? 'bg-gradient-to-r from-pink-500 to-[#FD5FC2] hover:opacity-90 text-white shadow-lg shadow-pink-500/30 cursor-pointer'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {loadingCheckout ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Processando...</span>
                    </>
                  ) : !selectedPackage ? (
                    'Selecione um pacote acima'
                  ) : !selectedPayment ? (
                    'Selecione um método de pagamento'
                  ) : (
                    'Finalizar Pagamento'
                  )}
                </button>
              </div>
            </div>
          </div>

          </main>
      </div>
    </div>
  )
}

function PaymentOption({
  active,
  onClick,
  flag,
  icon,
  title,
  subtitle,
  tag,
  discount,
}: {
  active: boolean
  onClick: () => void
  flag?: string
  icon?: React.ReactNode
  title: string
  subtitle: string
  tag?: string
  discount?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
        active
          ? 'border-pink-500 bg-pink-500/10'
          : 'border-gray-800 bg-[#1a1a1a] hover:border-gray-700'
      } cursor-pointer`}
    >
      <span className="flex items-center justify-center w-9 h-9 rounded-full bg-black/40 text-xl flex-shrink-0">
        {flag ?? icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-bold text-sm text-white">{title}</span>
        <span className="block text-xs text-gray-400">{subtitle}</span>
      </span>
      {tag && (
        <span className="text-[10px] font-black tracking-widest uppercase text-pink-300 bg-pink-500/15 px-2 py-1 rounded-full whitespace-nowrap">
          {tag}
        </span>
      )}
      {discount && (
        <span className="text-[10px] font-black tracking-widest uppercase text-green-300 bg-green-500/15 px-2 py-1 rounded-full whitespace-nowrap">
          {discount}
        </span>
      )}
    </button>
  )
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#2AABEE]" aria-hidden="true">
      <path d="M9.999 14.999l-.4 4.04c.572 0 .82-.246 1.118-.541l2.682-2.557 5.557 4.073c1.018.563 1.741.267 2.018-.943l3.658-17.13.001-.002c.327-1.508-.547-2.099-1.532-1.736L1.18 9.51C-.286 10.084-.255 10.918.81 11.287l5.846 1.825L20.13 4.732c.604-.394 1.155-.176.703.218L9.999 14.999z" />
    </svg>
  )
}

function CryptoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#F7931A" />
      <path
        d="M15.6 10.6c.2-1.3-.8-2-2.2-2.5l.5-1.8-1.1-.3-.4 1.8c-.3-.1-.6-.2-.9-.2l.4-1.8-1.1-.3-.5 1.8c-.2-.1-.5-.1-.7-.2l-1.5-.4-.3 1.2s.8.2.8.2c.4.1.5.4.5.6l-.5 2c0 0 .1 0 .1 0l-.1 0-.7 2.7c-.1.2-.2.4-.5.3 0 0-.8-.2-.8-.2l-.6 1.3 1.4.4c.3.1.5.1.8.2l-.5 1.8 1.1.3.5-1.8c.3.1.6.2.9.2l-.5 1.8 1.1.3.5-1.8c1.9.4 3.3.2 3.9-1.5.5-1.4 0-2.2-1-2.7.7-.2 1.2-.7 1.4-1.8zm-2.5 3.7c-.4 1.4-2.7.6-3.5.5l.6-2.6c.8.2 3.3.6 2.9 2.1zm.4-3.7c-.3 1.3-2.3.6-2.9.5l.6-2.3c.6.1 2.6.5 2.3 1.8z"
        fill="#fff"
      />
    </svg>
  )
}
