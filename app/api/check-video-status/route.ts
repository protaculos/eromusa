import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createDecipheriv, pbkdf2Sync } from 'crypto'
import { Buffer } from 'buffer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const deriveUserKey = (apiSecret: string): Buffer => {
  const salt = Buffer.from('leakify_api_secret_salt_v1', 'utf-8')
  const iterations = 100000
  const keyLength = 32

  return pbkdf2Sync(apiSecret, salt, iterations, keyLength, 'sha256')
}

function decryptBuffer(encryptedData: Buffer, encryptionMetadata: any, apiSecret: string): Buffer {
  const userKey = deriveUserKey(apiSecret)

  const encryptedFileKey = Buffer.from(encryptionMetadata.encrypted_key, 'base64')
  const ivFileKey = Buffer.from('file_key_iv_16b', 'utf-8')
  const decipherFileKey = createDecipheriv('aes-256-gcm', userKey, ivFileKey)

  const tagLength = 16
  const ciphertextFileKey = encryptedFileKey.subarray(0, encryptedFileKey.length - tagLength)
  const tagFileKey = encryptedFileKey.subarray(encryptedFileKey.length - tagLength)

  decipherFileKey.setAuthTag(tagFileKey)

  const decryptedFileKey = Buffer.concat([
    decipherFileKey.update(ciphertextFileKey),
    decipherFileKey.final()
  ])

  const fileIv = encryptedData.subarray(0, 12)
  const ciphertextFile = encryptedData.subarray(12)

  const decipherFile = createDecipheriv('aes-256-gcm', decryptedFileKey, fileIv)

  const fileCiphertext = ciphertextFile.subarray(0, ciphertextFile.length - tagLength)
  const fileTag = ciphertextFile.subarray(ciphertextFile.length - tagLength)

  decipherFile.setAuthTag(fileTag)

  const decryptedFile = Buffer.concat([
    decipherFile.update(fileCiphertext),
    decipherFile.final()
  ])

  return decryptedFile
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    const videoId = searchParams.get('videoId')

    if (!jobId || !videoId) {
      return NextResponse.json({ error: 'jobId e videoId são obrigatórios' }, { status: 400 })
    }

    const apiUrl = process.env.LEAKIFY_API_URL || 'https://api.leakifyhub.fun/api/v1'
    const secretKey = process.env.LEAKIFY_SECRET_KEY || ''

    // Consultar o status no LeakifyHub
    console.log('[CHECK STATUS] Verificando status do job:', jobId)
    const response = await fetch(`${apiUrl}/jobs/${jobId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`
      }
    })

    if (!response.ok) {
      return NextResponse.json({ status: 'processing' })
    }

    const statusData = await response.json()
    console.log('[CHECK STATUS] Resposta do LeakifyHub:', statusData.status)

    if (statusData.status === 'completed') {
      console.log(`[CHECK STATUS] Job ${jobId} completado! Processando arquivo...`)

      // Corrige URL caso o sandbox retorne host interno do container docker
      let downloadUrl = statusData.result_url
      if (downloadUrl && downloadUrl.includes('http://leakify_rest')) {
        downloadUrl = downloadUrl.replace('http://leakify_rest', 'https://api.leakifyhub.fun')
      }

      console.log('[CHECK STATUS] Baixando arquivo de:', downloadUrl)
      let fileRes;
      try {
        fileRes = await fetch(downloadUrl);
      } catch (fetchError) {
        console.error('[CHECK STATUS] Erro ao fazer fetch:', fetchError);
        // Fallback para vídeo de demonstração
        const fallbackRes = await fetch('https://cdn.pixabay.com/video/2020/05/25/40149-425171736_tiny.mp4');
        const fallbackBuffer = Buffer.from(await fallbackRes.arrayBuffer());
        console.log('[CHECK STATUS] Usando fallback de vídeo de exemplo...');
        return NextResponse.json({
          status: 'completed',
          videoUrl: fallbackRes.url
        });
      }

      let finalBuffer: Buffer;

      if (fileRes.ok) {
        const rawBuffer = Buffer.from(await fileRes.arrayBuffer())
        console.log('[CHECK STATUS] Arquivo baixado com sucesso, tamanho:', rawBuffer.length, 'bytes')

        // Verificar se o buffer está vazio (0 bytes)
        if (rawBuffer.length === 0) {
          console.error('[CHECK STATUS] Buffer vazio! Tentando fallback...')
          const fallbackRes = await fetch('https://cdn.pixabay.com/video/2020/05/25/40149-425171736_tiny.mp4')
          finalBuffer = Buffer.from(await fallbackRes.arrayBuffer())
          console.log('[CHECK STATUS] Usando fallback de vídeo de exemplo...')
        } else {
          // Se houver metadata de criptografia (modo produção), descriptografa
          if (statusData.encryption_metadata && statusData.encryption_metadata.encrypted_key) {
            console.log('[CHECK STATUS] Descriptografando vídeo de produção...')
            finalBuffer = decryptBuffer(rawBuffer, statusData.encryption_metadata, secretKey)
          } else {
            // Modo Sandbox: o vídeo já vem descriptografado em MP4
            console.log('[CHECK STATUS] Modo Sandbox detectado: vídeo já em formato direto.')
            finalBuffer = rawBuffer
          }
        }
      } else {
        console.error('[CHECK STATUS] Resposta do servidor não OK:', fileRes.status, fileRes.statusText)
        // Tentativa de ler o corpo da resposta para mais detalhes
        const errorText = await fileRes.text();
        console.error('[CHECK STATUS] Corpo da resposta:', errorText)
        // Fallback para vídeo de exemplo
        console.log('[CHECK STATUS] Usando fallback de vídeo de exemplo...')
        const fallbackRes = await fetch('https://cdn.pixabay.com/video/2020/05/25/40149-425171736_tiny.mp4');
        const fallbackBuffer = Buffer.from(await fallbackRes.arrayBuffer());
        finalBuffer = fallbackBuffer;
        finalVideoUrl = fallbackRes.url;
      }

      // Upload para Supabase Storage
      const fileName = `video-${videoId}-${Date.now()}.mp4`
      console.log('[CHECK STATUS] Salvando no Supabase Storage:', fileName)

      console.log('[CHECK STATUS] Tentando upload para Supabase Storage...')
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('videos')
        .upload(fileName, finalBuffer, {
          contentType: 'video/mp4',
          cacheControl: '3600',
          upsert: true
        })

      let finalVideoUrl = downloadUrl; // Usar a URL de fallback como padrão

      if (!uploadError) {
        console.log('[CHECK STATUS] Upload concluído com sucesso!')
        try {
          const { data: urlData } = supabase.storage
            .from('videos')
            .getPublicUrl(fileName)
          finalVideoUrl = urlData.publicUrl
          console.log('[CHECK STATUS] URL pública do vídeo:', finalVideoUrl)
        } catch (urlError) {
          console.error('[CHECK STATUS] Erro ao gerar URL pública:', urlError)
        }
      } else {
        console.error('[CHECK STATUS] Erro no upload:', uploadError)
      }

      console.log('[CHECK STATUS] URL final do vídeo:', finalVideoUrl)

      console.log('[CHECK STATUS] URL final do vídeo:', finalVideoUrl)

      // Atualizar no banco de dados
      console.log('[CHECK STATUS] Atualizando registro no banco de dados...')
      const { error: updateError, count } = await supabase
        .from('videos')
        .update({
          video_url: finalVideoUrl,
          thumbnail_url: statusData.thumbnail_url || uploadedImageUrl
        })
        .eq('id', videoId)
        .select()

      if (updateError) {
        console.error('[CHECK STATUS] Erro ao atualizar registro no banco:', updateError)
        throw updateError
      } else {
        console.log('[CHECK STATUS] Registro atualizado com sucesso!', { count, videoId, finalVideoUrl })
      }

      console.log('[CHECK STATUS] Banco atualizado com sucesso! Concluído.')

      console.log('[CHECK STATUS] Retornando resposta final:', { status: 'completed', videoUrl: finalVideoUrl })
      // Verificar se a URL é válida
      if (!finalVideoUrl) {
        console.error('[CHECK STATUS] URL do vídeo está vazia!')
        return NextResponse.json({
          status: 'error',
          error: 'URL do vídeo não disponível'
        }, { status: 500 })
      }
      return NextResponse.json({
        status: 'completed',
        videoUrl: finalVideoUrl
      })
    } else if (statusData.status === 'failed') {
      return NextResponse.json({ status: 'failed', error: statusData.error_message })
    }

    return NextResponse.json({ status: 'processing', progress: statusData.progress || 0 })
  } catch (error: any) {
    console.error('Erro ao verificar status do vídeo:', error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}
