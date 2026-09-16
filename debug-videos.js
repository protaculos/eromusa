const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function debugVideos() {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')

    if (error) {
      console.error('Erro ao buscar vídeos:', error)
    } else {
      console.log('Vídeos no banco de dados:')
      data.forEach(video => {
        console.log(`- ID: ${video.id}`)
        console.log(`  User ID: ${video.user_id}`)
        console.log(`  Video URL: ${video.video_url}`)
        console.log(`  Thumbnail URL: ${video.thumbnail_url}`)
        console.log(`  Created At: ${video.created_at}`)
        console.log('---')
      })
    }
  } catch (err) {
    console.error('Erro geral:', err)
  }
}

debugVideos()