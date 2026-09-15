import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// Nome do bucket onde as imagens serão armazenadas
const BUCKET_NAME = 'uploads'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Extrai a extensão do arquivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    // Verifica se o bucket existe, caso contrário cria
    const { data: bucketData, error: bucketError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', { limit: 1 })

    if (bucketError && bucketError.code !== 'PBR_NOT_FOUND') {
      console.error('Error checking bucket:', bucketError)
      return NextResponse.json({ error: 'Failed to check bucket' }, { status: 500 })
    }

    // Faz upload do arquivo para o Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file)

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Obtém o URL público da imagem
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)

    return NextResponse.json({ url: urlData.publicUrl })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}