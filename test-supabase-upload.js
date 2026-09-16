const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function testSupabaseUpload() {
  try {
    // Teste de upload de um arquivo de exemplo
    const filePath = path.join(__dirname, 'test-video.mp4')
    const fileBuffer = fs.readFileSync(filePath)

    console.log('Tentando upload para Supabase Storage...')
    const { data, error } = await supabase.storage
      .from('videos')
      .upload('test-upload.mp4', fileBuffer, {
        contentType: 'video/mp4',
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      console.error('Erro ao fazer upload:', error)
    } else {
      console.log('Upload concluído com sucesso!')

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl('test-upload.mp4')

      console.log('URL pública:', urlData.publicUrl)
    }
  } catch (err) {
    console.error('Erro geral:', err)
  }
}

testSupabaseUpload()