#!/bin/bash

# Let's Encrypt SSL Certificate Setup Script
# Run this on your PRODUCTION SERVER where flopsmaster.com is hosted

set -e

DOMAIN="flopsmaster.com"
EMAIL="your-email@example.com"  # Update this with your email
WEB_SERVER=""  # Will be detected automatically

echo "🔒 Let's Encrypt SSL Certificate Setup for $DOMAIN"
echo "=================================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

# Detect operating system
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
elif type lsb_release >/dev/null 2>&1; then
    OS=$(lsb_release -si | tr '[:upper:]' '[:lower:]')
elif [ -f /etc/lsb-release ]; then
    . /etc/lsb-release
    OS=$DISTRIB_ID
elif [ -f /etc/debian_version ]; then
    OS=debian
elif [ -f /etc/SuSe-release ]; then
    OS=suse
elif [ -f /etc/redhat-release ]; then
    OS=redhat
else
    OS=$(uname -s | tr '[:upper:]' '[:lower:]')
fi

echo "📋 Detected OS: $OS"
echo ""

# Detect web server
if command -v nginx >/dev/null 2>&1; then
    WEB_SERVER="nginx"
    echo "✅ Detected Nginx"
elif command -v apache2 >/dev/null 2>&1; then
    WEB_SERVER="apache2"
    echo "✅ Detected Apache2"
elif command -v httpd >/dev/null 2>&1; then
    WEB_SERVER="httpd"
    echo "✅ Detected Apache (httpd)"
else
    echo "⚠️  No web server detected. Proceeding with standalone mode."
    WEB_SERVER="standalone"
fi

echo ""

# Install Certbot
echo "📦 Installing Certbot..."
case $OS in
    ubuntu|debian)
        apt-get update
        if [ "$WEB_SERVER" = "nginx" ]; then
            apt-get install -y certbot python3-certbot-nginx
        elif [ "$WEB_SERVER" = "apache2" ]; then
            apt-get install -y certbot python3-certbot-apache
        else
            apt-get install -y certbot
        fi
        ;;
    centos|rhel|fedora)
        if [ "$OS" = "fedora" ]; then
            dnf install -y certbot
        else
            yum install -y epel-release
            yum install -y certbot
        fi
        if [ "$WEB_SERVER" = "nginx" ]; then
            yum install -y python3-certbot-nginx 2>/dev/null || echo "Plugin not available, using standalone mode"
        elif [ "$WEB_SERVER" = "httpd" ]; then
            yum install -y python3-certbot-apache 2>/dev/null || echo "Plugin not available, using standalone mode"
        fi
        ;;
    *)
        echo "⚠️  Unknown OS. Please install Certbot manually."
        echo "   Visit: https://certbot.eff.org/instructions"
        exit 1
        ;;
esac

echo "✅ Certbot installed"
echo ""

# Verify domain is pointing to this server
echo "🔍 Verifying domain DNS..."
IP=$(curl -s ifconfig.me || curl -s icanhazip.com || echo "")
echo "   Server IP: $IP"
echo "   Please verify $DOMAIN points to this IP"
echo "   Press Enter to continue or Ctrl+C to cancel..."
read

# Get certificate
echo ""
echo "🔐 Obtaining SSL certificate..."

if [ "$WEB_SERVER" = "nginx" ] && command -v certbot >/dev/null 2>&1; then
    echo "   Using Nginx plugin (automatic configuration)..."
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL
elif [ "$WEB_SERVER" = "apache2" ] || [ "$WEB_SERVER" = "httpd" ]; then
    if certbot --apache -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL 2>/dev/null; then
        echo "   Using Apache plugin (automatic configuration)..."
    else
        echo "   Using standalone mode (manual configuration required)..."
        systemctl stop $WEB_SERVER
        certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL
        systemctl start $WEB_SERVER
    fi
else
    echo "   Using standalone mode..."
    systemctl stop $WEB_SERVER 2>/dev/null || true
    certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL
    systemctl start $WEB_SERVER 2>/dev/null || true
fi

echo ""
echo "✅ Certificate obtained!"
echo ""

# List certificates
echo "📜 Installed certificates:"
certbot certificates

echo ""
echo "🔄 Setting up auto-renewal..."

# Test renewal
certbot renew --dry-run

# Add cron job for renewal
(crontab -l 2>/dev/null | grep -v certbot; echo "0 0,12 * * * /usr/bin/certbot renew --quiet") | crontab -

echo "✅ Auto-renewal configured (runs twice daily)"
echo ""

echo "🎉 Setup Complete!"
echo ""
echo "📝 Next steps:"
echo "1. Configure your web server to use the certificate"
echo "2. See LETS_ENCRYPT_SETUP.md for configuration examples"
echo "3. Test your SSL: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo ""
echo "📁 Certificate location: /etc/letsencrypt/live/$DOMAIN/"
echo "   - fullchain.pem (use this in web server config)"
echo "   - privkey.pem (use this in web server config)"
echo ""

