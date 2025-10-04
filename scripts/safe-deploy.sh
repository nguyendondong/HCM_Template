#!/bin/bash

# Script to safely deploy hosting without affecting database
# Usage: ./scripts/safe-deploy.sh

set -e  # Exit on any error

echo "🚀 Starting safe hosting deployment..."

# Backup current .env
if [ -f ".env" ]; then
    cp .env .env.backup
    echo "📄 Backed up current .env file"
fi

# Copy production environment
cp .env.production .env
echo "🔧 Using production environment settings"

# Build for production
echo "🏗️  Building for production..."
yarn build

# Show what we're about to deploy
echo "📋 Deployment Summary:"
echo "   📦 Project: hcmtemplate"
echo "   🌐 Target: Hosting only"
echo "   🔒 Database: Will NOT be affected"
echo "   📁 Environment: Production"

# Confirm before deploying
read -p "❓ Continue with deployment? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Deploying hosting..."
    firebase deploy --only hosting --project hcmtemplate
    echo "✅ Deployment completed successfully!"
else
    echo "❌ Deployment cancelled"
fi

# Restore original .env if it existed
if [ -f ".env.backup" ]; then
    mv .env.backup .env
    echo "🔄 Restored original .env file"
fi

echo "🎉 Process completed!"
