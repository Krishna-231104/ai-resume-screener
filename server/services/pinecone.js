const { Pinecone } = require('@pinecone-database/pinecone')
const { ChatGroq } = require('@langchain/groq')
const { PromptTemplate } = require('@langchain/core/prompts')
const { OpenAIEmbeddings } = require('@langchain/openai')

let pinecone = null

const initPinecone = async () => {
  if (pinecone) return pinecone
  
  pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT || 'gcp-starter'
  })
  
  return pinecone
}

const embedPortfolios = async (portfolios) => {
  try {
    const pc = await initPinecone()
    const embeddings = new OpenAIEmbeddings({
      apiKey: process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-3-small'
    })

    const index = pc.index('candidates')

    for (const portfolio of portfolios) {
      const text = `
        Name: ${portfolio.userId.name}
        Bio: ${portfolio.bio}
        Skills: ${portfolio.skills.join(', ')}
        Projects: ${portfolio.projects.map(p => p.title).join(', ')}
        Experience: ${portfolio.experience.map(e => e.role).join(', ')}
      `

      const embedding = await embeddings.embedQuery(text)
      
      await index.upsert({
        vectors: [{
          id: portfolio._id.toString(),
          values: embedding,
          metadata: {
            userId: portfolio.userId._id.toString(),
            name: portfolio.userId.name,
            skills: portfolio.skills,
            username: portfolio.username
          }
        }]
      })
    }

    console.log('✅ Portfolios embedded in Pinecone')
  } catch (err) {
    console.error('Pinecone embedding error:', err)
  }
}

const ragChatbot = async (query, userId) => {
  try {
    const pc = await initPinecone()
    const embeddings = new OpenAIEmbeddings({
      apiKey: process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-3-small'
    })

    // Get embedding for user query
    const queryEmbedding = await embeddings.embedQuery(query)
    
    // Search Pinecone for similar portfolios
    const index = pc.index('candidates')
    const results = await index.query({
      vector: queryEmbedding,
      topK: 3,
      includeMetadata: true
    })

    // Prepare context from search results
    let context = ''
    results.matches.forEach(match => {
      context += `Candidate: ${match.metadata.name}\n`
      context += `Skills: ${match.metadata.skills.join(', ')}\n\n`
    })

    // Generate response using RAG
    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7
    })

    const prompt = PromptTemplate.fromTemplate(`
      You are an AI recruiter assistant helping candidates find opportunities and employers find talent.
      
      Based on the following context about candidates, answer the user's question helpfully and conversationally.
      
      Context:
      {context}
      
      User question: {query}
      
      Provide a helpful response about potential matches or career advice.
    `)

    const chain = prompt.pipe(model)
    const response = await chain.invoke({
      context: context || 'No matching candidates found yet.',
      query
    })

    return {
      message: response.content,
      candidates: results.matches.map(m => ({
        name: m.metadata.name,
        skills: m.metadata.skills,
        score: m.score
      }))
    }
  } catch (err) {
    console.error('RAG chatbot error:', err)
    throw err
  }
}

module.exports = { initPinecone, embedPortfolios, ragChatbot }
