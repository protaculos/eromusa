'use client'

import Header from './components/Header'
import GenderSelector from './components/GenderSelector'
import StyleSelector from './components/StyleSelector'
import GenerateButton from './components/GenerateButton'

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      <div>
        <Header />

        <main className="container mx-auto px-4 pt-10 pb-8 text-center">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-8 bg-gradient-to-r from-white via-pink-200 to-pink-500 bg-clip-text text-transparent">
            CREATE YOUR DREAM AI GIRL
          </h1>

          <GenderSelector />

          <StyleSelector />
        </main>
      </div>

      <GenerateButton />
    </div>
  )
}
