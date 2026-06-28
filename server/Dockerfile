# Use official Node.js LTS slim image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy all server source files
COPY . .

# Expose the port Render will use
EXPOSE 10000

# Start the server
CMD ["node", "server.js"]
