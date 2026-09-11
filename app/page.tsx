'use client'

import Header from './components/Header'
import GenderSelector from './components/GenderSelector'
import StyleSelector from './components/StyleSelector'
import GenerateButton from './components/GenerateButton'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col justify-between">
      <div>
        <Header />

        <main className="max-w-xl mx-auto px-4 pt-8 pb-4 text-center">
          <GenderSelector />

          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-6">
            <div className="text-white">ENVIE UMA FOTO</div>
            <div className="text-[#FD5FC2]">CRIE UM VÍDEO +18</div>
          </h1>

          <StyleSelector />
        </main>
      </div>

      <div className="max-w-xl w-full mx-auto flex justify-center mb-8 px-4">
        <GenerateButton />
      </div>
    </div>
  )
}
