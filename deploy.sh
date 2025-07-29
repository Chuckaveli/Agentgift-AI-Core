#!/bin/bash

echo "🚀 AgentGift AI - Deployment Script"
echo "=================================="

# Step 1: Clean up lockfiles
echo "📦 Cleaning up lockfiles..."
rm -rf node_modules
rm -f pnpm-lock.yaml
rm -f package-lock.json
rm -f yarn.lock

# Step 2: Install dependencies
echo "📦 Installing dependencies with pnpm..."
pnpm install

# Step 3: Build the project
echo "🔨 Building the project..."
pnpm build

# Step 4: Check for errors
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Step 5: Git operations
echo "📝 Committing changes..."
git add .
git commit -m "Fix pnpm lockfile and prepare for deployment"
git push

echo "🎉 Deployment script completed!"
echo "Next steps:"
echo "1. Set environment variables in Vercel"
echo "2. Deploy to Vercel"
echo "3. Test all features" 