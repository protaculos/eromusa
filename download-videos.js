/**
 * Script para baixar vídeos do Mixkit
 *
 * INSTRUÇÕES:
 * 1. Abra o terminal na pasta do projeto
 * 2. Execute: node download-videos.js
 * 3. Os vídeos serão baixados para /public/videos/
 *
 * Vídeos de: https://mixkit.co (Licença gratuita para uso comercial)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const videosDir = path.join(__dirname, 'public', 'videos');

// Garantir que o diretório existe
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
  console.log('✓ Diretório /public/videos/ criado');
}

// Vídeos do Mixkit (gratuitos para uso comercial)
// Substitua estas URLs por vídeos do site: https://mixkit.co/free-stock-video/
const videoUrls = [
  {
    name: 'video1.mp4',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-portrait-of-a-happy-smiling-woman-4859-large.mp4'
  },
  {
    name: 'video2.mp4',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-handsome-young-man-with-smooth-skin-4853-large.mp4'
  },
  {
    name: 'video3.mp4',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-with-curly-hair-blowing-in-the-wind-4815-large.mp4'
  },
  {
    name: 'video4.mp4',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-elegant-woman-with-long-brown-hair-4814-large.mp4'
  },
  {
    name: 'video5.mp4',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-posing-near-the-camera-4816-large.mp4'
  },
  {
    name: 'video6.mp4',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-posing-in-the-studio-4817-large.mp4'
  },
  {
    name: 'video7.mp4',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-happy-young-woman-4830-large.mp4'
  },
  {
    name: 'video8.mp4',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-woman-posing-for-the-camera-4832-large.mp4'
  }
];

function downloadVideo(video) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(videosDir, video.name);
    console.log(`\n📥 Baixando ${video.name}...`);
    console.log(`   URL: ${video.url}`);

    // Verificar se arquivo já existe e tem tamanho > 0
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.size > 1000) { // Maior que 1KB, provavelmente válido
        console.log(`   ⏭️  Pulando (já existe: ${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
        resolve();
        return;
      }
    }

    const file = fs.createWriteStream(filePath);

    const request = https.get(video.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (response) => {
      if (response.statusCode === 200 || response.statusCode === 302 || response.statusCode === 301) {
        // Seguir redirecionamentos
        if (response.statusCode !== 200) {
          console.log(`   🔄 Redirecionando...`);
          https.get(response.headers.location, (redirectResponse) => {
            if (redirectResponse.statusCode === 200) {
              redirectResponse.pipe(file);
            }
          });
        } else {
          response.pipe(file);
        }

        file.on('finish', () => {
          file.close();
          const stats = fs.statSync(filePath);
          if (stats.size > 1000) {
            console.log(`   ✅ Sucesso! (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
          } else {
            console.log(`   ⚠️  Arquivo muito pequeno, pode estar corrompido`);
          }
          resolve();
        });
      } else {
        file.close();
        console.log(`   ❌ Erro HTTP: ${response.statusCode}`);
        resolve(); // Continua mesmo com erro
      }
    });

    request.on('error', (err) => {
      file.close();
      console.log(`   ❌ Erro de conexão: ${err.message}`);
      resolve(); // Continua mesmo com erro
    });

    request.setTimeout(30000, () => {
      request.destroy();
      file.close();
      console.log(`   ❌ Timeout (30s)`);
      resolve();
    });
  });
}

async function downloadAll() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  📹 Download de Vídeos para EroMusa AI');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\n📁 Salvando em: ${videosDir}`);
  console.log(`📊 Total de vídeos: ${videoUrls.length}`);

  let successCount = 0;
  let failCount = 0;

  for (const video of videoUrls) {
    await downloadVideo(video)
      .then(() => successCount++)
      .catch(() => failCount++);
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  📊 RESUMO');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  ✅ Baixados: ${successCount}`);
  console.log(`  ❌ Falhas: ${failCount}`);

  if (successCount > 0) {
    console.log('\n  Para usar os vídeos:');
    console.log('  1. Edite src/app/page.tsx');
    console.log('  2. Remova as vírgulas extras na array videos[]');
    console.log('  3. Descomente a linha videoUrls = videos');
  }

  if (failCount > 0) {
    console.log('\n  ⚠️  Alguns vídeos não puderam ser baixados.');
    console.log('  Os gradientes animados continuam funcionando como fallback.');
  }
}

downloadAll().catch(console.error);