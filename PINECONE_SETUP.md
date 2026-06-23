# Pinecone + RAG Chatbot Setup

## Overview

The AI Resume Screener now includes an intelligent RAG (Retrieval Augmented Generation) chatbot powered by:
- **Pinecone** - Vector database for semantic search
- **LangChain** - Framework for AI chains
- **Groq API** - Fast LLM inference
- **OpenAI Embeddings** - Text vectorization

## Features

✅ Semantic search across candidate portfolios
✅ RAG-powered intelligent responses
✅ Real-time candidate recommendations
✅ Career advice and guidance
✅ Multi-turn conversations

## Setup

### 1. Create Pinecone Account

- Go to [pinecone.io](https://www.pinecone.io)
- Create free account
- Create index named `candidates` with:
  - Dimension: 1536
  - Metric: cosine
  - Pod type: starter

### 2. Add Environment Variables

Add to `.env`:
```
PINECONE_API_KEY=your_api_key
PINECONE_ENVIRONMENT=gcp-starter (or your environment)
OPENAI_API_KEY=your_openai_key (for embeddings)
```

### 3. Install Dependencies

```bash
cd server
npm install
```

New packages:
- `@pinecone-database/pinecone` - Pinecone client
- `@langchain/pinecone` - LangChain integration

### 4. Initial Data Sync

When you add new portfolios, sync them to Pinecone:

```bash
# Call this endpoint (admin only)
curl -X POST http://localhost:5000/api/chatbot/sync-portfolios \
  -H "authorization: your_token" \
  -H "Content-Type: application/json"
```

Or automatically sync when a portfolio is created/updated in portfolio routes.

## API Endpoints

### POST `/api/chatbot/chat`
Send a message to the chatbot.

**Request:**
```json
{
  "message": "Find me a React developer with Node.js experience"
}
```

**Response:**
```json
{
  "message": "Based on my search, I found 3 candidates...",
  "candidates": [
    {
      "name": "John Doe",
      "skills": ["React", "Node.js", "MongoDB"],
      "score": 0.92
    }
  ]
}
```

### POST `/api/chatbot/sync-portfolios`
Admin endpoint to sync all portfolios to Pinecone.

## How RAG Works

1. **User asks a question** → "Find React developers"
2. **Convert to vector** → OpenAI embeddings
3. **Search Pinecone** → Find top 3 similar candidates
4. **Build context** → Extract candidate info
5. **Generate response** → Groq LLM with context
6. **Return answer** → Natural language + candidates

## Example Chatbot Interactions

**User:** "I'm looking for a full-stack developer with 3+ years experience"
**Bot:** "I found 2 candidates matching your criteria... John has React, Node.js, and MongoDB..."

**User:** "What skills do I need to land a job at a startup?"
**Bot:** "Based on trending portfolios, startups look for... Here are candidates with those skills..."

**User:** "Show me frontend engineers in my area"
**Bot:** "I searched our database and found..."

## Embedding & Sync Strategy

### Auto-Sync on Portfolio Update

Update `routes/portfolio.js`:
```javascript
const { embedPortfolios } = require('../services/pinecone')

// After creating or updating portfolio
await embedPortfolios([updatedPortfolio])
```

### Manual Sync (Admin)

```bash
POST /api/chatbot/sync-portfolios
```

### Batch Sync (Scheduled)

Add to cron job (e.g., daily):
```javascript
const cron = require('node-cron')
const { embedPortfolios } = require('./services/pinecone')

cron.schedule('0 2 * * *', async () => {
  const portfolios = await Portfolio.find().populate('userId')
  await embedPortfolios(portfolios)
  console.log('Daily Pinecone sync completed')
})
```

## Cost Considerations

- **Pinecone Free Tier:** 1 project, 100k vectors, unlimited queries
- **OpenAI Embeddings:** ~$0.02 per 1M tokens
- **Groq API:** Free tier available
- **Total:** ~$0-5/month for small scale

## Troubleshooting

**"Pinecone API Key invalid"**
- Check `.env` PINECONE_API_KEY

**"No candidates found"**
- Sync portfolios: `POST /api/chatbot/sync-portfolios`
- Check Pinecone index exists

**"Slow responses"**
- Reduce topK in pinecone.js (currently 3)
- Use smaller model or cached embeddings

**"Embeddings API rate limit"**
- Implement caching for repeated queries
- Use batch embedding for sync

## Future Enhancements

1. **Persistent chat history** - Store conversations in MongoDB
2. **User preferences** - Remember user interests
3. **Feedback loop** - Improve matches based on feedback
4. **Multi-language** - Support multiple languages
5. **Real-time collaboration** - Live candidate updates
6. **Analytics** - Track chatbot interactions

## References

- [Pinecone Docs](https://docs.pinecone.io)
- [LangChain Pinecone](https://js.langchain.com/docs/modules/data_connection/vectorstores/integrations/pinecone)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)
- [RAG Pattern](https://blogs.nvidia.com/blog/what-is-retrieval-augmented-generation/)
