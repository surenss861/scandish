# Use multi-stage build for better optimization
FROM node:20-alpine AS base

# Install system dependencies and create non-root user
RUN apk add --no-cache dumb-init && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install dependencies in separate layer for better caching
FROM base AS dependencies
RUN npm ci --only=production --omit=dev && npm cache clean --force

# Development dependencies stage
FROM base AS dev-dependencies
RUN npm ci && npm cache clean --force

# Build stage (if needed for TypeScript or build processes)
FROM dev-dependencies AS build
COPY src ./src
# Add any build commands here if needed
# RUN npm run build

# Production stage
FROM base AS production

# Copy production dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application source code
COPY src ./src

# Create app directory with proper permissions
RUN chown -R nodejs:nodejs /app
USER nodejs

# Set production environment
ENV NODE_ENV=production
ENV PORT=4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4000/api/ai-insights/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Expose port
EXPOSE 4000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/index.js"]




