const { Pinecone } = require('@pinecone-database/pinecone')
const { ChatGroq } = require('@langchain/groq')
const { PromptTemplate } = require('@langchain/core/prompts')

const INDEX_NAME = 'ai-resume-screener'
const EMBED_MODEL = 'multilingual-e5-large'
const EMBED_DIMENSION = 1024 // multilingual-e5-large output dimension

let pc = null
let pineconeIndex = null

// ─── Lazy init — only connects when first used ────────────────────────────────
const initPinecone = async () => {
  if (pc && pineconeIndex) return pineconeIndex

  if (!process.env.PINECONE_API_KEY) {
    throw new Error('PINECONE_API_KEY is not set in environment variables')
  }

  pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })

  // Auto-create index if it doesn't exist
  const { indexes } = await pc.listIndexes()
  const exists = indexes?.some(i => i.name === INDEX_NAME)

  if (!exists) {
    console.log(`🔵 Creating Pinecone index: ${INDEX_NAME}...`)
    await pc.createIndex({
      name: INDEX_NAME,
      dimension: EMBED_DIMENSION,
      metric: 'cosine',
      spec: {
        serverless: { cloud: 'aws', region: 'us-east-1' }
      }
    })
    // Wait for index to be ready (serverless is usually fast)
    console.log('⏳ Waiting for index to be ready...')
    await new Promise(resolve => setTimeout(resolve, 15000))
    console.log('✅ Pinecone index ready!')
  }

  pineconeIndex = pc.index(INDEX_NAME)
  console.log('✅ Pinecone connected to index:', INDEX_NAME)
  return pineconeIndex
}

// ─── Embed text using Pinecone's own Inference API (no OpenAI needed!) ────────
const embedTexts = async (texts) => {
  if (!pc) await initPinecone()
  const response = await pc.inference.embed(
    EMBED_MODEL,
    texts,
    { inputType: 'passage', truncate: 'END' }
  )
  return response.data.map(e => e.values)
}

// ─── Build a rich text representation of a portfolio for embedding ─────────────
const portfolioToText = (portfolio) => {
  const skills = portfolio.skills?.join(', ') || ''
  const projects = portfolio.projects?.map(p => `${p.title}: ${p.description}`).join('. ') || ''
  const experience = portfolio.experience?.map(e => `${e.role} at ${e.company} (${e.duration})`).join('. ') || ''
  const education = portfolio.education?.map(e => `${e.degree} from ${e.institution}`).join('. ') || ''

  return `
    Developer Profile: ${portfolio.userId?.name || ''}
    Bio: ${portfolio.bio || ''}
    Skills: ${skills}
    Experience: ${experience}
    Education: ${education}
    Projects: ${projects}
  `.trim()
}

// ─── Embed and store a single portfolio in Pinecone ───────────────────────────
const embedSinglePortfolio = async (portfolio) => {
  try {
    const index = await initPinecone()
    const text = portfolioToText(portfolio)
    const [vector] = await embedTexts([text])

    await index.upsert([{
      id: portfolio._id.toString(),
      values: vector,
      metadata: {
        userId: portfolio.userId?._id?.toString() || portfolio.userId?.toString(),
        name: portfolio.userId?.name || 'Unknown',
        username: portfolio.username || '',
        skills: portfolio.skills || [],
        bio: (portfolio.bio || '').slice(0, 500) // Pinecone metadata limit
      }
    }])

    console.log(`✅ Portfolio embedded in Pinecone: ${portfolio.username}`)
  } catch (err) {
    // Non-fatal — app works without Pinecone
    console.error('⚠️ Pinecone embed error (non-fatal):', err.message)
  }
}

// ─── Batch embed all portfolios (admin sync) ──────────────────────────────────
const embedPortfolios = async (portfolios) => {
  try {
    const index = await initPinecone()
    console.log(`🔵 Embedding ${portfolios.length} portfolios into Pinecone...`)

    const texts = portfolios.map(portfolioToText)
    const vectors = await embedTexts(texts)

    const upsertData = portfolios.map((portfolio, i) => ({
      id: portfolio._id.toString(),
      values: vectors[i],
      metadata: {
        userId: portfolio.userId?._id?.toString() || portfolio.userId?.toString(),
        name: portfolio.userId?.name || 'Unknown',
        username: portfolio.username || '',
        skills: portfolio.skills || [],
        bio: (portfolio.bio || '').slice(0, 500)
      }
    }))

    // Upsert in batches of 100 (Pinecone limit)
    for (let i = 0; i < upsertData.length; i += 100) {
      await index.upsert(upsertData.slice(i, i + 100))
    }

    console.log(`✅ ${portfolios.length} portfolios synced to Pinecone`)
  } catch (err) {
    console.error('⚠️ Pinecone batch embed error:', err.message)
    throw err
  }
}

// ─── Semantic candidate search for recruiters ─────────────────────────────────
const semanticSearch = async (jobDescription, topK = 10) => {
  try {
    const index = await initPinecone()

    // Embed the job description as a query
    const [queryVector] = await embedTexts([jobDescription])

    // Search Pinecone for semantically similar portfolios
    const results = await index.query({
      vector: queryVector,
      topK,
      includeMetadata: true
    })

    return results.matches.map(match => ({
      portfolioId: match.id,
      score: Math.round(match.score * 100), // Convert cosine similarity to 0-100
      name: match.metadata.name,
      username: match.metadata.username,
      skills: match.metadata.skills,
      bio: match.metadata.bio,
      userId: match.metadata.userId
    }))
  } catch (err) {
    console.error('⚠️ Pinecone search error:', err.message)
    return [] // Return empty if Pinecone fails
  }
}

// ─── RAG Chatbot — retrieves relevant candidates before answering ──────────────
const ragChatbot = async (message, userId) => {
  try {
    const index = await initPinecone()

    // Embed the user's message
    const [queryVector] = await embedTexts([message])

    // Retrieve top 3 most relevant candidates from Pinecone
    const results = await index.query({
      vector: queryVector,
      topK: 3,
      includeMetadata: true
    })

    // Build context from retrieved candidates
    let retrievedContext = ''
    results.matches.forEach((match, i) => {
      retrievedContext += `Candidate ${i + 1}: ${match.metadata.name}\n`
      retrievedContext += `Skills: ${Array.isArray(match.metadata.skills) ? match.metadata.skills.join(', ') : match.metadata.skills}\n`
      retrievedContext += `Bio: ${match.metadata.bio}\n`
      retrievedContext += `Match Score: ${Math.round(match.score * 100)}%\n\n`
    })

    // Generate response using retrieved context (RAG pattern)
    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7
    })

    const prompt = PromptTemplate.fromTemplate(`
      You are an intelligent AI recruiter assistant with access to a database of developer candidates.
      Use the retrieved candidate profiles below as context to give accurate, helpful responses.
      
      Retrieved Candidates (from vector similarity search):
      {context}
      
      User's message: {message}
      
      Give a helpful, conversational response. If the user is asking about candidates or skills,
      reference the retrieved profiles. If asking general questions, answer directly.
    `)

    const chain = prompt.pipe(model)
    const response = await chain.invoke({
      context: retrievedContext || 'No matching candidates found in the database yet.',
      message
    })

    return {
      message: response.content,
      retrievedCandidates: results.matches.map(m => ({
        name: m.metadata.name,
        username: m.metadata.username,
        skills: m.metadata.skills,
        matchScore: Math.round(m.score * 100)
      }))
    }
  } catch (err) {
    console.error('⚠️ RAG chatbot error:', err.message)
    throw err
  }
}

module.exports = {
  initPinecone,
  embedSinglePortfolio,
  embedPortfolios,
  semanticSearch,
  ragChatbot
}
