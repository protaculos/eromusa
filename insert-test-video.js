const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wgmkktdnkpakxyaqgjux.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnbWtrdGRua3Bha3h5YXFnanV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyOTE1MzcsImV4cCI6MjEwMzg2NzUzN30.j2wK4hK3O-P7BiD0B0l2HtPm00lp_m-NCt3eiywRI2s';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Função para inserir um vídeo de teste
async function insertTestVideo() {
  try {
    // Gerar um UUID válido para teste
    const testUserId = 'd1a4a6e6-1b8e-45d5-9f2d-8a8c3e9b7d9a'; // UUID válido para teste

    // Verificar se já existe um vídeo de teste para evitar duplicação
    const { data: existingVideos, error: fetchError } = await supabase
      .from('videos')
      .select('id')
      .eq('user_id', testUserId);

    if (fetchError) {
      console.error('Erro ao buscar vídeos existentes:', fetchError);
      return;
    }

    if (existingVideos && existingVideos.length > 0) {
      console.log('Vídeo de teste já existe no banco de dados.');
      return;
    }

    // URL de um vídeo de exemplo (você pode substituir por uma URL de vídeo público ou usar um arquivo local)
    const videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-woman-in-white-sweater-smiling-at-camera-4163-large.mp4';
    const thumbnailUrl = 'https://via.placeholder.com/400x300?text=Thumbnail+Test';

    // Inserir vídeo de teste
    const { data, error } = await supabase
      .from('videos')
      .insert([
        {
          user_id: testUserId,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Erro ao inserir vídeo de teste:', error);
    } else {
      console.log('Vídeo de teste inserido com sucesso! ID:', data[0].id);
    }
  } catch (err) {
    console.error('Erro geral:', err);
  }
}

// Executar a função
insertTestVideo();