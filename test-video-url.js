const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function checkVideoUrls() {
  try {
    console.log('Verificando vídeos no banco de dados...')

    const { data: videos, error } = await supabase
      .from('videos')
      .select('*')

    if (error) {
      console.error('Erro ao buscar vídeos:', error)
    } else {
      console.log('Vídeos no banco de dados:')
      videos.forEach(video => {
        console.log(`- ID: ${video.id}`)
        console.log(`  User ID: ${video.user_id}`)
        console.log(`  Video URL: ${video.video_url}`)
        console.log(`  Thumbnail URL: ${video.thumbnail_url}`)
        console.log('---')
      })
    }

    // Verificar se os vídeos estão no bucket
    const { data: bucketFiles, error: bucketError } = await supabase.storage
      .from('videos')
      .list()

    if (bucketError) {
      console.error('Erro ao listar arquivos no bucket:', bucketError)
    } else {
      console.log('Arquivos no bucket "videos":')
      bucketFiles.forEach(file => {
        if (file.name.endsWith('.mp4')) {
          console.log(`- ${file.name}`)
        }
      })
    }
  } catch (err) {
    console.error('Erro geral:', err)
  }
}

checkVideoUrls()