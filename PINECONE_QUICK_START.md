# Quick Pinecone Setup Guide

## ⚡ 5-Minute Setup

### Step 1: Create Pinecone Account
```
1. Go to https://www.pinecone.io
2. Click "Sign Up" (free account)
3. Create account with email
4. Verify email
```

### Step 2: Create Index
In Pinecone Dashboard:
```
1. Click "Create Index"
2. Name: candidates
3. Dimension: 1536
4. Metric: cosine
5. Pod Type: starter (free)
6. Click "Create"
```

### Step 3: Get API Key
```
1. Go to "API Keys" section
2. Copy your API key
3. Note your environment (e.g., gcp-starter)
```

### Step 4: Get OpenAI API Key
```
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key
```

### Step 5: Update Environment

**Option A: Windows (Easiest)**
```powershell
# Navigate to project root
cd C:\Users\YourName\OneDrive\Documents\ai-resume-screener

# Run setup script
.\setup-pinecone.bat

# Follow prompts and enter your API keys
```

**Option B: Mac/Linux**
```bash
cd ~/Documents/ai-resume-screener
chmod +x setup-pinecone.sh
./setup-pinecone.sh
```

**Option C: Manual**
Open `.env` and add:
```
PINECONE_API_KEY=your_key_here
PINECONE_ENVIRONMENT=gcp-starter
OPENAI_API_KEY=your_key_here
```

### Step 6: Test Connection
```bash
cd server
npm run test:pinecone
```

You should see:
```
✅ Connected to Pinecone!
✅ "candidates" index found! Ready to use.
✅ Embeddings working!
```

### Step 7: Start Server
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev

# Navigate to http://localhost:5173
```

### Step 8: Create Portfolios & Test Chatbot

1. Register as "developer"
2. Create a portfolio with skills, projects, etc.
3. Go to Chatbot page (`/chatbot`)
4. First sync portfolios to Pinecone:
   ```bash
   # Make POST request to:
   POST http://localhost:5000/api/chatbot/sync-portfolios
   ```
5. Try asking: "Find me a React developer" or "What skills are trending?"

---

## 🆘 Troubleshooting

**"PINECONE_API_KEY is undefined"**
- Make sure .env file exists and has the key
- Restart server after adding to .env

**"Cannot find index 'candidates'"**
- Go to Pinecone dashboard
- Create index with exact name "candidates"
- Dimension must be 1536

**"OpenAI API key invalid"**
- Get a new key from https://platform.openai.com/api-keys
- Free trial includes $5 credits

**Chatbot returns no results**
- Sync portfolios: `POST /api/chatbot/sync-portfolios`
- Create more portfolios first (at least 3)
- Check Pinecone dashboard to verify data

---

## 💰 Cost

**Free Tier Limits:**
- Pinecone: 100k vectors, unlimited queries
- OpenAI: $5 free trial credit
- Total: $0 for testing, ~$5-20/month at scale

**To Save Money:**
- Use Groq API instead (free)
- Cache embeddings
- Batch sync instead of real-time

---

## ✅ Verification Checklist

- [ ] Pinecone account created
- [ ] "candidates" index created
- [ ] API key copied
- [ ] PINECONE_API_KEY added to .env
- [ ] OPENAI_API_KEY added to .env
- [ ] `npm run test:pinecone` passes
- [ ] Server started (`npm run dev`)
- [ ] At least 3 portfolios created
- [ ] Portfolios synced to Pinecone
- [ ] Chatbot page loads
- [ ] Chatbot returns responses

---

## 🎉 You're Done!

Your AI Resume Screener now has:
- ✅ Vector database (Pinecone)
- ✅ Semantic search
- ✅ RAG chatbot
- ✅ Real-time recommendations

Enjoy! 🚀
