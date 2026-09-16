import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const FILTER_TO_STYLE_MAP: { [key: string]: string } = {
  'boquete': 'blowjob-v2',
  'missionario': 'missionary-v2',
  'doggy': 'doggy-v2',
  'cowgirl': 'cowgirl-v2',
  'solo': 'solo-v2',
  'teta': 'titjob-v2',
  'standing': 'standing-v2'
}

function getStyleFromFilter(filter: string): string {
  const normalized = filter.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  return FILTER_TO_STYLE_MAP[normalized] || 'blowjob-v2'
}

export async function POST(request: Request) {
  try {
    const { imageUrl, filter, userId } = await request.json()

    if (!imageUrl || !userId) {
      return NextResponse.json(
        { error: 'URL da imagem e ID do usuário são obrigatórios' },
        { status: 400 }
      )
    }

    // 1. Verificar créditos do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Perfil do usuário não encontrado' }, { status: 404 })
    }

    if (profile.credits < 30) {
      return NextResponse.json({ error: 'Créditos insuficientes. Você precisa de pelo menos 30 créditos.' }, { status: 402 })
    }

    const style = getStyleFromFilter(filter || 'Boquete')
    const apiUrl = process.env.LEAKIFY_API_URL || 'https://api.leakifyhub.fun/api/v1'
    const secretKey = process.env.LEAKIFY_SECRET_KEY || ''

    if (!secretKey) {
      return NextResponse.json({ error: 'Configuração da API do LeakifyHub ausente' }, { status: 500 })
    }

    // 2. Chamar endpoint POST /jobs/generate no LeakifyHub
    console.log('[LEAKIFYHUB] Enviando requisição para:', `${apiUrl}/jobs/generate`)
    console.log('[LEAKIFYHUB] Dados:', { image_url: imageUrl, style, type: 'video', duration: 10 })
    console.log('[LEAKIFYHUB] Chave de autorização:', secretKey ? '*****' : 'NÃO CONFIGURADA')

    const generateRes = await fetch(`${apiUrl}/jobs/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secretKey}`
      },
      body: JSON.stringify({
        image_url: imageUrl,
        style,
        type: 'video',
        duration: 10
      })
    })

    console.log('[LEAKIFYHUB] Status da resposta:', generateRes.status)
    const generateData = await generateRes.json().catch(() => ({}))
    console.log('[LEAKIFYHUB] Dados completos da resposta:', generateData)

    if (!generateRes.ok) {
      console.error('[LEAKIFYHUB] Resposta inválida:', generateData)
      throw new Error(generateData.error_message || generateData.message || 'Erro ao submeter job no LeakifyHub')
    }

    if (!generateData.job_id) {
      console.error('[LEAKIFYHUB] Job ID não retornado:', generateData)
      throw new Error('Job ID não retornado pelo LeakifyHub')
    }

    const jobId = generateData.job_id

    // 3. Deduzir 30 créditos do perfil do usuário
    await supabase
      .from('profiles')
      .update({ credits: profile.credits - 30 })
      .eq('id', userId)

    // 4. Inserir o registro provisório na tabela de vídeos salvando o jobId diretamente
    console.log('Inserindo registro provisório no banco de dados...')
    const { data: insertedVideo, error: insertError } = await supabase
      .from('videos')
      .insert({
        user_id: userId,
        video_url: `processing:${jobId}`,
        thumbnail_url: imageUrl,
        expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single()

    console.log('Registro inserido:', insertedVideo)
    if (insertError || !insertedVideo) {
      console.error('Erro ao criar registro do vídeo provisório:', insertError)
      return NextResponse.json({ error: 'Falha ao iniciar processamento do vídeo' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      jobId,
      videoRecordId: insertedVideo.id,
      message: 'Vídeo em processamento!'
    })

  } catch (error: any) {
    console.error('Erro ao processar criação de vídeo:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
