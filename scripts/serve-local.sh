#!/bin/bash

# Local Development Server for Testing Static Build
# Serves the React build locally to test before AWS deployment

set -e

BUILD_DIR="./frontend/build"
PORT="3002"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🌍 Starting Local Static Server${NC}"
echo "==============================="

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${YELLOW}⚠️  Build directory not found. Building React app...${NC}"
    cd frontend && npm run build && cd ..
fi

# Check if serve is installed globally
if ! command -v serve &> /dev/null; then
    echo -e "${YELLOW}📦 Installing 'serve' globally...${NC}"
    npm install -g serve
fi

echo -e "${GREEN}🚀 Starting server on port $PORT...${NC}"
echo -e "${GREEN}🌐 Local URL: http://localhost:$PORT${NC}"
echo -e "${YELLOW}📝 Press Ctrl+C to stop the server${NC}"
echo ""

# Start the server
serve -s $BUILD_DIR -l $PORT
