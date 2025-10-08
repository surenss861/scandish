#!/bin/bash

# Scandish Docker Build Script
# Usage: ./build.sh [target] [--no-cache]

set -e

# Default values
FRONTEND_TARGET=${1:-development}
BACKEND_TARGET=${2:-production}
NO_CACHE=${3:-""}

echo "🐳 Building Scandish Docker containers..."
echo "Frontend target: $FRONTEND_TARGET"
echo "Backend target: $BACKEND_TARGET"

# Build arguments
BUILD_ARGS=""
if [ "$NO_CACHE" = "--no-cache" ]; then
    BUILD_ARGS="--no-cache"
    echo "Building without cache..."
fi

# Export environment variables for docker-compose
export FRONTEND_TARGET=$FRONTEND_TARGET
export BACKEND_TARGET=$BACKEND_TARGET

# Build the containers
echo "📦 Building containers..."
docker-compose build $BUILD_ARGS

echo "✅ Build complete!"
echo ""
echo "Available targets:"
echo "  Frontend: development, production"
echo "  Backend: production, dependencies, dev-dependencies, build"
echo ""
echo "Usage examples:"
echo "  ./build.sh development production    # Development frontend, production backend"
echo "  ./build.sh production production     # Production for both"
echo "  ./build.sh development production --no-cache  # Build without cache"
echo ""
echo "To start the services:"
echo "  docker-compose up -d"
