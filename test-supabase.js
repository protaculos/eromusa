const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function getVideosSchema() {
  try {
    console.log('Buscando estrutura da tabela "videos"...')

    // Tenta fazer um insert inválido de propósito para obter informações de erro com as colunas,
    // ou faz uma consulta de uma linha com select para ver o que retorna.
    const { data, error } = await supabase
      .from('videos')
      .insert({})
      .select()

    if (error) {
      console.log('Erro retornado (contém dicas da estrutura):', error.message)
      if (error.details) console.log('Detalhes:', error.details)
      if (error.hint) console.log('Dica:', error.hint)
    } else {
      console.log('Dados inseridos com sucesso:', data)
    }

    // Também podemos buscar informações fazendo uma requisição HTTP para a API do PostgREST
    // que descreve o schema do banco de dados (OpenAPI spec do Supabase/PostgREST).
    const restUrl = `${supabaseUrl}/rest/v1/?apikey=${supabaseServiceKey}`
    const res = await fetch(restUrl)
    const schema = await res.json()

    if (schema && schema.paths && schema.paths['/videos']) {
      console.log('\n--- ESTRUTURA DA TABELA "videos" (via OpenAPI Spec) ---')
      const postParams = schema.paths['/videos'].post?.parameters || []
      postParams.forEach(param => {
        if (param.schema) {
          console.log(`Campo: ${param.name} (${param.type || 'unknown'}) - ${param.description || ''}`)
        }
      })

      console.log('\nPropriedades em definitions:')
      const definition = schema.definitions?.videos
      if (definition && definition.properties) {
        Object.keys(definition.properties).forEach(prop => {
          const p = definition.properties[prop]
          console.log(`- ${prop}: ${p.type} ${p.format ? `(${p.format})` : ''} ${p.description || ''}`)
        })
      }
    }
  } catch (err) {
    console.error('Erro:', err)
  }
}

getVideosSchema()