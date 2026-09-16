'use client'

import React, { useState, useRef, useCallback } from 'react'

interface ImageUploadProps {
  currentCarouselImage: string
  onImageUpload?: (file: File | null) => void
}

export default function ImageUpload({ currentCarouselImage, onImageUpload }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [originalFile, setOriginalFile] = useState<File | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const processFile = (file: File) => {
    // Armazena a imagem original para envio
    setOriginalFile(file)

    // Processa a imagem para preview (1:1 com bordas pretas)
    const reader = new FileReader()
    reader.onload = (uploadEvent) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) return

        // Define o tamanho do quadrado com base na MENOR dimensão da imagem
        // Isso garante que a imagem final seja compacta e não exagere no tamanho do arquivo
        const size = Math.min(img.width, img.height)
        canvas.width = size
        canvas.height = size

        // Preenche o fundo de preto
        ctx.fillStyle = 'black'
        ctx.fillRect(0, 0, size, size)

        // Calcula a escala para a imagem caber inteira dentro do quadrado (contain)
        const scale = size / Math.max(img.width, img.height)
        const scaledWidth = img.width * scale
        const scaledHeight = img.height * scale

        // Centraliza a imagem redimensionada no quadrado
        const offsetX = (size - scaledWidth) / 2
        const offsetY = (size - scaledHeight) / 2
        ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight)

        // Converte o canvas para base64 (formato 1:1 com bordas pretas e tamanho reduzido)
        const paddedImageData = canvas.toDataURL('image/jpeg', 0.9)
        setPreviewUrl(paddedImageData)

        // Dispara callback para notificar que a imagem original está pronta para envio
        if (onImageUpload) {
          onImageUpload(file)
        }
      }
      img.src = uploadEvent.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      processFile(files[0])
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      processFile(files[0])
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreviewUrl(null)
    setOriginalFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    // Notifica que a imagem foi removida
    if (onImageUpload) {
      onImageUpload(null)
    }
  }

  return (
    <div
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative aspect-square rounded-3xl overflow-hidden border-2 border-dashed cursor-pointer transition-all duration-300 group ${
        isDragging ? 'border-pink-500 bg-pink-500/10' : 'border-gray-700 hover:border-pink-500/50'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="w-full h-full bg-black relative flex flex-col items-center justify-center p-0 text-center">
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Uploaded preview"
              className="w-full h-full object-contain pointer-events-none select-none"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="px-4 py-2 bg-pink-500 text-white text-xs md:text-sm font-medium rounded-full shadow-lg">
                Alterar Foto
              </span>
            </div>
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 w-6 h-6 md:w-7 md:h-7 bg-black/70 rounded-full flex items-center justify-center text-white shadow-md hover:bg-pink-600 transition z-10 text-xs"
              aria-label="Remover foto"
            >
              ✕
            </button>
          </>
        ) : (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center opacity-50"
              style={currentCarouselImage ? { backgroundImage: `url(${currentCarouselImage})` } : {}}
            />
            <div className="absolute inset-0 bg-black/35" />

            <div className="flex flex-col items-center justify-center space-y-2 md:space-y-3 z-10 w-full px-1 p-6">
              <div className="w-10 h-10 md:w-16 md:h-16 rounded-2xl bg-pink-500/30 border border-pink-500/60 flex items-center justify-center text-pink-500 group-hover:scale-105 transition-transform shadow-lg shadow-pink-500/20">
                <svg className="w-5 h-5 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div className="w-full">
                <p className="text-white font-bold text-base md:text-xl tracking-tight whitespace-nowrap drop-shadow-md">Envie uma foto</p>
                <p className="text-gray-100 text-sm md:text-base mt-1 leading-tight drop-shadow">
                  Foto da galeria<br className="block md:hidden" /> <span className="md:whitespace-nowrap">ou navegador</span>
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
