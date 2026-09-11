'use client'

import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'

interface AdminCarouselManagerProps {
  categorySlug: string
  onUpdate: () => void
}

export default function AdminCarouselManager({ categorySlug, onUpdate }: AdminCarouselManagerProps) {
  const [uploading, setUploading] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setVideoFile(file)
  }

  const processAndUpload = async () => {
    if (!videoFile) return
    setUploading(true)

    try {
      // 1. Extrair frame para a thumbnail
      const thumbnailBlob = await extractFirstFrame(videoFile)
      const thumbnailFile = new File([thumbnailBlob], `thumb_${videoFile.name}.jpg`, { type: 'image/jpeg' })

      // 2. Upload do vídeo para o Storage
      const videoPath = `carousel/${categorySlug}/${Date.now()}_${videoFile.name}`
      const { data: videoData, error: videoError } = await supabase.storage
        .from('videos')
        .upload(videoPath, videoFile)

      if (videoError) throw videoError
      const videoUrl = supabase.storage.from('videos').getPublicUrl(videoPath).data.publicUrl

      // 3. Upload da thumbnail para o Storage
      const thumbPath = `thumbnails/${categorySlug}/${Date.now()}_thumb.jpg`
      const { data: thumbData, error: thumbError } = await supabase.storage
        .from('thumbnails')
        .upload(thumbPath, thumbnailFile)

      if (thumbError) throw thumbError
      const thumbUrl = supabase.storage.from('thumbnails').getPublicUrl(thumbPath).data.publicUrl

      // 4. Salvar no banco de dados
      const { data: category } = await supabase
        .from('carousel_categories')
        .select('id')
        .eq('slug', categorySlug)
        .single()

      if (!category) throw new Error('Categoria não encontrada')

      const { error: dbError } = await supabase.from('carousel_items').insert({
        category_id: category.id,
        video_url: videoUrl,
        thumbnail_url: thumbUrl,
        order: 0 // O sistema pode calcular a última ordem
      })

      if (dbError) throw dbError

      alert('Vídeo adicionado com sucesso!')
      onUpdate()
    } catch (error) {
      console.error('Upload error:', error)
      alert('Erro ao fazer upload')
    } finally {
      setUploading(false)
      setVideoFile(null)
    }
  }

  async function extractFirstFrame(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.src = URL.createObjectURL(file)
      video.muted = true
      video.currentTime = 0.1 // Pega o frame em 0.1s para evitar tela preta inicial

      video.onloadeddata = () => {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject('Erro ao obter contexto do canvas')

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject('Erro ao criar blob da thumbnail')
        }, 'image/jpeg', 0.8)
      }
      video.onerror = (e) => reject(e)
    })
  }

  return (
    <div className="bg-gray-900/80 p-4 rounded-2xl border border-pink-500/30 mt-4">
      <h3 className="text-pink-500 font-bold mb-3 text-sm">Painel Admin: {categorySlug}</h3>
      <div className="flex flex-col space-y-3">
        <input
          type="file"
          accept="video/*"
          onChange={handleFileUpload}
          className="text-xs text-gray-400 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-pink-500 file:text-white hover:file:bg-pink-600"
        />
        <button
          onClick={processAndUpload}
          disabled={!videoFile || uploading}
          className="bg-pink-600 hover:bg-pink-700 disabled:bg-gray-700 text-white text-xs py-2 rounded-full transition-all"
        >
          {uploading ? 'Subindo vídeo...' : 'Adicionar ao Carrossel'}
        </button>
      </div>
    </div>
  )
}
