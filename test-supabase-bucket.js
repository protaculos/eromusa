const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function testBucketAccess() {
  try {
    console.log('Verificando acesso ao bucket "videos"...')

    // Listar arquivos no bucket
    const { data, error } = await supabase.storage
      .from('videos')
      .list()

    if (error) {
      console.error('Erro ao listar arquivos no bucket:', error)
    } else {
      console.log('Arquivos no bucket "videos":', data)
    }

    // Tentar criar um arquivo de teste
    const testFileName = 'test-file.txt'
    const testFileContent = 'Este é um arquivo de teste.'
    const fileBuffer = Buffer.from(testFileContent)

    console.log('Tentando criar arquivo de teste...')
    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(testFileName, fileBuffer, {
        contentType: 'text/plain',
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Erro ao fazer upload do arquivo de teste:', uploadError)
    } else {
      console.log('Arquivo de teste criado com sucesso!')

      // Obter URL pública do arquivo de teste
      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(testFileName)

      console.log('URL pública do arquivo de teste:', urlData.publicUrl)
    }
  } catch (err) {
    console.error('Erro geral:', err)
  }
}

testBucketAccess()