# Docker Setup Guide

## Prerequisites
- Docker Desktop installed
- Docker Compose installed

## Quick Start

### 1. Copy environment file
```bash
cp .env.example .env
```
Update `.env` with your API keys.

### 2. Build & run containers
```bash
docker-compose up --build
```

### 3. Access application
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000
- **MongoDB:** localhost:27017

## Commands

### Start services
```bash
docker-compose up
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f server
docker-compose logs -f client
```

### Rebuild images
```bash
docker-compose build --no-cache
```

### Execute commands in container
```bash
docker-compose exec server npm install
docker-compose exec client npm run build
```

## Services

- **mongodb** - Database on port 27017
- **server** - Node.js API on port 5000
- **client** - React app on port 5173

## Environment Variables

All services read from `.env`:
- MONGODB_URI
- JWT_SECRET
- GROQ_API_KEY
- EMAIL_USER / EMAIL_PASSWORD
- CLIENT_URL / VITE_API_URL

## Production Build

For production, modify `docker-compose.yml`:
```yaml
services:
  client:
    image: ai-resume-client:latest
    ports:
      - "80:5173"
```

Then build:
```bash
docker build -t ai-resume-client:latest ./client
docker build -t ai-resume-server:latest ./server
```

Push to Docker Hub or ECR for deployment.
