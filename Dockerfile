# Multi-stage Dockerfile for Unified Full-Stack Deployment
# Stage 1: Build the React + Vite Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Serve via Python FastAPI Backend
FROM python:3.11-slim
WORKDIR /app

# Install backend dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend application and trained ML models
COPY backend/ ./backend/

# Copy built frontend static bundle
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Render sets PORT dynamically (defaults to 8000)
ENV PORT=8000
EXPOSE 8000

# Launch server
CMD python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT
