# Quick Start: Let's Encrypt SSL Setup

## ⚠️ Important: Run on Your Production Server

This script must be run on your **production server** where `flopsmaster.com` is hosted, NOT on your local macOS machine.

## Prerequisites Checklist

- [ ] Your domain `flopsmaster.com` points to your server's IP address
- [ ] Ports 80 (HTTP) and 443 (HTTPS) are open in firewall
- [ ] You have root/sudo access on the server
- [ ] Web server (Nginx or Apache) is installed and running
- [ ] Your site files are deployed to the server

## Quick Setup (Automatic)

### Step 1: Upload the script to your server

```bash
# From your local machine, copy the script to your server
scp setup-letsencrypt.sh user@your-server-ip:/tmp/
```

### Step 2: SSH into your server

```bash
ssh user@your-server-ip
```

### Step 3: Edit the script with your email

```bash
cd /tmp
nano setup-letsencrypt.sh
# Update EMAIL="your-email@example.com" with your actual email
```

### Step 4: Run the script

```bash
chmod +x setup-letsencrypt.sh
sudo ./setup-letsencrypt.sh
```

The script will:
- ✅ Detect your OS and web server
- ✅ Install Certbot
- ✅ Obtain SSL certificate
- ✅ Configure auto-renewal

## Manual Setup (Step by Step)

### For Ubuntu/Debian:

```bash
# 1. Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx  # For Nginx
# OR
sudo apt-get install certbot python3-certbot-apache  # For Apache

# 2. Get certificate (Nginx - automatic)
sudo certbot --nginx -d flopsmaster.com -d www.flopsmaster.com

# OR get certificate (standalone mode)
sudo systemctl stop nginx  # or apache2
sudo certbot certonly --standalone -d flopsmaster.com -d www.flopsmaster.com
sudo systemctl start nginx  # or apache2

# 3. Test renewal
sudo certbot renew --dry-run

# 4. Set up auto-renewal
sudo crontab -e
# Add this line:
0 0,12 * * * /usr/bin/certbot renew --quiet
```

### For CentOS/RHEL:

```bash
# 1. Install Certbot
sudo yum install epel-release
sudo yum install certbot python3-certbot-nginx  # For Nginx

# 2. Get certificate
sudo certbot --nginx -d flopsmaster.com -d www.flopsmaster.com

# 3. Test renewal
sudo certbot renew --dry-run

# 4. Set up auto-renewal
sudo crontab -e
# Add this line:
0 0,12 * * * /usr/bin/certbot renew --quiet
```

## After Getting Certificate

### If using automatic mode (certbot --nginx or --apache):

Certbot automatically configures your web server! Just verify:
1. Visit https://flopsmaster.com
2. Should see green padlock
3. HTTP redirects to HTTPS automatically

### If using standalone mode:

You need to manually configure your web server. See `LETS_ENCRYPT_SETUP.md` for:
- Nginx configuration
- Apache configuration
- Certificate paths: `/etc/letsencrypt/live/flopsmaster.com/`

## Verify SSL

1. **Browser test:**
   - Visit https://flopsmaster.com
   - Click padlock icon → Should show "Connection is secure"

2. **SSL Labs test:**
   - Visit: https://www.ssllabs.com/ssltest/analyze.html?d=flopsmaster.com
   - Should get "A" or "A+" rating

3. **Command line test:**
   ```bash
   openssl s_client -connect flopsmaster.com:443 -servername flopsmaster.com < /dev/null
   ```

## Troubleshooting

### "Domain not pointing to this server"
- Verify DNS: `dig flopsmaster.com` or `nslookup flopsmaster.com`
- Update DNS records if needed
- Wait for DNS propagation (can take up to 48 hours)

### "Port 80 already in use"
```bash
# Check what's using port 80
sudo lsof -i :80
# Stop conflicting service or use webroot method
```

### "Certificate already exists"
```bash
# List existing certificates
sudo certbot certificates
# Delete if needed
sudo certbot delete --cert-name flopsmaster.com
```

### Web server won't start after configuration
```bash
# Test configuration
sudo nginx -t  # For Nginx
sudo apache2ctl configtest  # For Apache

# Check logs
sudo journalctl -u nginx  # For Nginx
sudo journalctl -u apache2  # For Apache
```

## Need Help?

See detailed guide: `LETS_ENCRYPT_SETUP.md`

Or visit:
- Let's Encrypt docs: https://letsencrypt.org/docs/
- Certbot instructions: https://certbot.eff.org/instructions

