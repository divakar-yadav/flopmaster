#!/bin/bash

# Quick deployment script for Netlify with SSL
echo "🚀 Deploying to Netlify with automatic SSL..."

# Build the project
echo "📦 Building project..."
npm run build

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "⚠️  Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Deploy to production
echo "🚀 Deploying to production..."
netlify deploy --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Go to https://app.netlify.com"
echo "2. Open your site → Site settings → Domain management"
echo "3. Add custom domain: flopsmaster.com"
echo "4. Configure DNS (CNAME or A records)"
echo "5. Go to Site settings → Domain management → HTTPS"
echo "6. Click 'Verify DNS configuration' → 'Provision certificate'"
echo "7. Enable 'Force HTTPS'"
echo ""
echo "🔒 SSL will be automatically configured!"

