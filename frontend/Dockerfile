# Multi-stage build for optimized production image
FROM node:20-alpine AS base

# Install system dependencies and create non-root user
RUN apk add --no-cache dumb-init && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Dependencies stage - install all dependencies
FROM base AS dependencies
RUN npm ci && npm cache clean --force

# Build stage - copy source and build the application
FROM dependencies AS build
COPY . .

# Set build-time environment variables
ENV NODE_ENV=production
ENV VITE_NODE_ENV=production

# Build the application
RUN npm run build

# Production stage with nginx for serving static files
FROM nginx:alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy built application from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set proper permissions
RUN chown -R nodejs:nodejs /usr/share/nginx/html && \
    chown -R nodejs:nodejs /var/cache/nginx && \
    chown -R nodejs:nodejs /var/log/nginx && \
    chown -R nodejs:nodejs /etc/nginx/conf.d

# Create nginx pid directory
RUN mkdir -p /var/run/nginx && \
    chown -R nodejs:nodejs /var/run/nginx

USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5173/ || exit 1

# Expose port
EXPOSE 5173

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["nginx", "-g", "daemon off;"]

# Development stage (alternative for development)
FROM dependencies AS development
COPY . .

# Create app directory with proper permissions
RUN chown -R nodejs:nodejs /app
USER nodejs

# Set development environment
ENV NODE_ENV=development

# Expose port
EXPOSE 5173

# Health check for development
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5173/ || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

