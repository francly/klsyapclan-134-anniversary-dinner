FROM node:20-alpine

WORKDIR /app

# Install dependencies (including express backend)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Expose port 3000 (Backend + Frontend)
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production
ENV DATA_DIR=/app/data

# Start Node.js server
CMD ["node", "server.cjs"]
