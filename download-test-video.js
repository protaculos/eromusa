const fs = require('fs')
const https = require('https')

const fileUrl = 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
const filePath = './test-video.mp4'

const file = fs.createWriteStream(filePath)

https.get(fileUrl, (response) => {
  response.pipe(file)

  file.on('finish', () => {
    file.close()
    console.log('Download concluído!')
  })
}).on('error', (err) => {
  console.error('Erro ao fazer download:', err)
})