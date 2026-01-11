#!/bin/bash

# Quick deployment script for Vercel with SSL
echo "🚀 Deploying to Vercel with automatic SSL..."

# Build the project
echo "📦 Building project..."
npm run build

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Deploy to production
echo "🚀 Deploying to production..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Open your project → Settings → Domains"
echo "3. Add: flopsmaster.com and www.flopsmaster.com"
echo "4. Update DNS records as shown in Vercel"
echo "5. SSL certificate will be automatically provisioned (5-15 minutes)"
echo ""
echo "🔒 SSL will work automatically once DNS is configured!"

