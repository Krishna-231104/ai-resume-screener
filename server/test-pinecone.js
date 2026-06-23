const axios = require('axios')

async function testPineconeConnection() {
  console.log('🧪 Testing Pinecone Connection...\n')

  // Check environment variables
  const checks = {
    'PINECONE_API_KEY': process.env.PINECONE_API_KEY,
    'PINECONE_ENVIRONMENT': process.env.PINECONE_ENVIRONMENT,
    'OPENAI_API_KEY': process.env.OPENAI_API_KEY,
  }

  console.log('📋 Environment Variables Check:')
  let allSet = true
  for (const [key, value] of Object.entries(checks)) {
    const status = value ? '✅' : '❌'
    console.log(`${status} ${key}: ${value ? 'SET' : 'MISSING'}`)
    if (!value) allSet = false
  }

  if (!allSet) {
    console.log('\n❌ Some environment variables are missing!')
    console.log('Please add them to .env file or run: npm run setup:pinecone\n')
    process.exit(1)
  }

  // Try to initialize Pinecone
  try {
    console.log('\n🔗 Initializing Pinecone...')
    const { Pinecone } = require('@pinecone-database/pinecone')
    
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT
    })

    // List indexes
    console.log('📇 Fetching indexes...')
    const indexes = await pc.listIndexes()
    
    console.log('✅ Connected to Pinecone!')
    console.log(`\n📊 Available Indexes:`)
    if (indexes.indexes && indexes.indexes.length > 0) {
      indexes.indexes.forEach(idx => {
        console.log(`  - ${idx.name}`)
      })
    } else {
      console.log('  (No indexes found)')
    }

    // Check for candidates index
    if (indexes.indexes?.some(idx => idx.name === 'candidates')) {
      console.log('\n✅ "candidates" index found! Ready to use.')
    } else {
      console.log('\n⚠️  "candidates" index not found.')
      console.log('Create it at https://app.pinecone.io with:')
      console.log('  - Name: candidates')
      console.log('  - Dimension: 1536')
      console.log('  - Metric: cosine')
    }

    // Test OpenAI embeddings
    console.log('\n🔤 Testing OpenAI Embeddings...')
    const { OpenAIEmbeddings } = require('@langchain/openai')
    const embeddings = new OpenAIEmbeddings({
      apiKey: process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-3-small'
    })

    const testEmbedding = await embeddings.embedQuery('test')
    console.log(`✅ Embeddings working! Dimension: ${testEmbedding.length}`)

    console.log('\n✨ All systems ready for Pinecone RAG chatbot!\n')

  } catch (err) {
    console.error('\n❌ Connection failed!')
    console.error(`Error: ${err.message}\n`)
    process.exit(1)
  }
}

// Run test
testPineconeConnection().catch(console.error)
