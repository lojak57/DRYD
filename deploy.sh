#!/bin/bash

# Display help information
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
  echo "Dryad Restoration App - Deployment Script"
  echo "----------------------------------------"
  echo "Usage: ./deploy.sh [options]"
  echo ""
  echo "Options:"
  echo "  --production, -p    Deploy to production"
  echo "  --preview, -d       Deploy a preview (default)"
  echo "  --help, -h          Show this help message"
  exit 0
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "Vercel CLI not found. Installing..."
  npm install -g vercel
fi

# Build the app
echo "Building the application..."
npm run build

# Set deployment mode
DEPLOY_MODE="--preview"
DEPLOY_TEXT="preview"

if [ "$1" == "--production" ] || [ "$1" == "-p" ]; then
  DEPLOY_MODE="--prod"
  DEPLOY_TEXT="production"
fi

# Deploy to Vercel
echo "Deploying to $DEPLOY_TEXT environment..."
vercel $DEPLOY_MODE

echo "Deployment complete!" 