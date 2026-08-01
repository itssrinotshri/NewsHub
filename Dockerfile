# =========================================================
# Stage 1: Build the React Application
# =========================================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package descriptors first to cache npm install layers
COPY package.json package-lock.json ./

# Install project dependencies
RUN npm ci --silent

# Copy application source files
COPY . .

# Run production build compilation
RUN npm run build

# =========================================================
# Stage 2: Serve the compiled static assets via Nginx
# =========================================================
FROM nginx:stable-alpine AS runner

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Launch Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
