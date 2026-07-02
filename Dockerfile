# Multi-stage build: build frontend and backend, then run backend serving static frontend

# Builder stage
FROM node:18-bullseye-slim AS builder
WORKDIR /app

# Copy package files for frontend and backend
COPY frontend/package.json frontend/package-lock.json ./frontend/
COPY backend/package.json backend/package-lock.json ./backend/

# Install and build frontend
WORKDIR /app/frontend
RUN npm ci --silent
COPY frontend/ .
RUN npm run build

# Build backend
WORKDIR /app/backend
RUN npm install --silent
COPY backend/ .
RUN npm run build

# Final runtime image
FROM node:18-bullseye-slim
WORKDIR /app

# Copy built backend and frontend dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY backend/package.json ./backend/package.json
COPY backend/package-lock.json ./backend/package-lock.json

# Create data directory for persistent storage
RUN mkdir -p /app/data

ENV NODE_ENV=production
EXPOSE ${PORT:-5000}

# Install production dependencies so runtime has required packages
RUN npm install --production --silent --prefix ./backend

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 5000) + '/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "backend/dist/index.js"]
