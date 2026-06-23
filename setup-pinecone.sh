#!/bin/bash
# Pinecone Setup Script
# This script helps you set up Pinecone for the AI Resume Screener

echo "🚀 AI Resume Screener - Pinecone Setup"
echo "======================================"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "✅ Created .env file"
fi

echo ""
echo "📋 Setup Steps:"
echo "1. Go to https://www.pinecone.io"
echo "2. Sign up for free account"
echo "3. Create index named 'candidates' with:"
echo "   - Dimension: 1536"
echo "   - Metric: cosine"
echo "   - Pod type: starter (free tier)"
echo ""
echo "4. Copy your API key from dashboard"
echo ""

read -p "✓ Have you created Pinecone account and index? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please complete the Pinecone setup first at https://www.pinecone.io"
    exit 1
fi

echo ""
read -p "Enter your Pinecone API Key: " PINECONE_API_KEY
read -p "Enter your Pinecone Environment (e.g., gcp-starter): " PINECONE_ENV
read -p "Enter your OpenAI API Key (for embeddings): " OPENAI_API_KEY

# Update .env file
if [ -f ".env" ]; then
    # Update or add Pinecone variables
    sed -i.bak "s/PINECONE_API_KEY=.*/PINECONE_API_KEY=$PINECONE_API_KEY/" .env
    sed -i "s/PINECONE_ENVIRONMENT=.*/PINECONE_ENVIRONMENT=$PINECONE_ENV/" .env
    sed -i "s/OPENAI_API_KEY=.*/OPENAI_API_KEY=$OPENAI_API_KEY/" .env
    
    # If lines don't exist, add them
    if ! grep -q "PINECONE_API_KEY" .env; then
        echo "PINECONE_API_KEY=$PINECONE_API_KEY" >> .env
    fi
    if ! grep -q "PINECONE_ENVIRONMENT" .env; then
        echo "PINECONE_ENVIRONMENT=$PINECONE_ENV" >> .env
    fi
    if ! grep -q "OPENAI_API_KEY" .env; then
        echo "OPENAI_API_KEY=$OPENAI_API_KEY" >> .env
    fi
    
    echo "✅ Updated .env file"
fi

echo ""
echo "📦 Installing dependencies..."
cd server
npm install @pinecone-database/pinecone @langchain/pinecone
echo "✅ Dependencies installed"

echo ""
echo "✨ Pinecone setup complete!"
echo ""
echo "Next steps:"
echo "1. Start server: npm run start (or nodemon server.js)"
echo "2. Create some portfolios"
echo "3. Sync to Pinecone: POST /api/chatbot/sync-portfolios"
echo "4. Try chatbot: http://localhost:5173/chatbot"
