# Stage 1: Build the React Application
FROM node:20-alpine AS builder

WORKDIR /app/frontend

# Install dependencies first for Docker cache optimization
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

# Copy root .env (from parent context) and frontend source code
COPY .env* /app/
COPY frontend/ /app/frontend/

RUN npm run build

# Stage 2: Serve with Nginx Alpine
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy build artifacts from builder stage
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
