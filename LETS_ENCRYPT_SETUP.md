# Let's Encrypt SSL Certificate Setup Guide

## Prerequisites

1. Your domain `flopsmaster.com` must be pointing to your server's IP address
2. Ports 80 (HTTP) and 443 (HTTPS) must be open in your firewall
3. Root or sudo access to your server
4. Web server installed (Nginx or Apache)

## Step 1: Install Certbot

### macOS:
```bash
brew install certbot
```

### Ubuntu/Debian:
```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx  # For Nginx
# OR
sudo apt-get install certbot python3-certbot-apache  # For Apache
```

### CentOS/RHEL:
```bash
sudo yum install epel-release
sudo yum install certbot python3-certbot-nginx  # For Nginx
# OR
sudo yum install certbot python3-certbot-apache  # For Apache
```

## Step 2: Stop Your Web Server Temporarily

**For Nginx:**
```bash
sudo systemctl stop nginx
```

**For Apache:**
```bash
sudo systemctl stop apache2
# OR on some systems:
sudo systemctl stop httpd
```

## Step 3: Get the Certificate

### Standalone Method (Easiest - No Web Server Running)

```bash
sudo certbot certonly --standalone -d flopsmaster.com -d www.flopsmaster.com
```

This will:
- Start a temporary web server on port 80
- Verify domain ownership
- Save certificates to `/etc/letsencrypt/live/flopsmaster.com/`

### Webroot Method (Web Server Must Be Running)

```bash
sudo certbot certonly --webroot -w /var/www/html -d flopsmaster.com -d www.flopsmaster.com
```

### Automatic Installation (Recommended if Certbot plugins installed)

**For Nginx:**
```bash
sudo certbot --nginx -d flopsmaster.com -d www.flopsmaster.com
```

**For Apache:**
```bash
sudo certbot --apache -d flopsmaster.com -d www.flopsmaster.com
```

This automatically configures your web server!

## Step 4: Configure Your Web Server

### For Nginx:

Edit your Nginx configuration file (usually `/etc/nginx/sites-available/flopsmaster.com` or `/etc/nginx/nginx.conf`):

```nginx
# HTTP to HTTPS Redirect
server {
    listen 80;
    listen [::]:80;
    server_name flopsmaster.com www.flopsmaster.com;
    
    # Redirect all HTTP requests to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS Configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name flopsmaster.com www.flopsmaster.com;
    
    # SSL Certificate Configuration
    ssl_certificate /etc/letsencrypt/live/flopsmaster.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/flopsmaster.com/privkey.pem;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Your Site Root
    root /var/www/flopsmaster/dist;  # Update this path to your dist folder
    index index.html;
    
    # Logging
    access_log /var/log/nginx/flopsmaster.com-access.log;
    error_log /var/log/nginx/flopsmaster.com-error.log;
    
    # Serve Static Files
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache Static Assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Test Nginx configuration:**
```bash
sudo nginx -t
```

**If test passes, reload Nginx:**
```bash
sudo systemctl reload nginx
# OR
sudo nginx -s reload
```

### For Apache:

Edit your Apache configuration file (usually `/etc/apache2/sites-available/flopsmaster.com.conf` or `/etc/httpd/conf.d/flopsmaster.com.conf`):

```apache
# HTTP to HTTPS Redirect
<VirtualHost *:80>
    ServerName flopsmaster.com
    ServerAlias www.flopsmaster.com
    
    # Redirect all HTTP requests to HTTPS
    Redirect permanent / https://flopsmaster.com/
</VirtualHost>

# HTTPS Configuration
<VirtualHost *:443>
    ServerName flopsmaster.com
    ServerAlias www.flopsmaster.com
    
    # SSL Certificate Configuration
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/flopsmaster.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/flopsmaster.com/privkey.pem
    SSLCertificateChainFile /etc/letsencrypt/live/flopsmaster.com/chain.pem
    
    # SSL Configuration
    SSLProtocol all -SSLv2 -SSLv3
    SSLCipherSuite HIGH:!aNULL:!MD5
    SSLHonorCipherOrder on
    
    # Security Headers
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    Header always set X-Frame-Options "DENY"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    
    # Your Site Root
    DocumentRoot /var/www/flopsmaster/dist  # Update this path to your dist folder
    
    <Directory /var/www/flopsmaster/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # Rewrite Rules for SPA
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
    
    # Logging
    ErrorLog ${APACHE_LOG_DIR}/flopsmaster.com-error.log
    CustomLog ${APACHE_LOG_DIR}/flopsmaster.com-access.log combined
</VirtualHost>
```

**Enable SSL module (if not already enabled):**
```bash
sudo a2enmod ssl
sudo a2enmod rewrite
sudo a2enmod headers
```

**Enable the site:**
```bash
sudo a2ensite flopsmaster.com.conf
```

**Test Apache configuration:**
```bash
sudo apache2ctl configtest
# OR on some systems:
sudo httpd -t
```

**If test passes, reload Apache:**
```bash
sudo systemctl reload apache2
# OR
sudo systemctl reload httpd
```

## Step 5: Set Up Auto-Renewal

Let's Encrypt certificates expire after 90 days. Set up automatic renewal:

### Test Renewal:
```bash
sudo certbot renew --dry-run
```

### Set Up Cron Job:

```bash
sudo crontab -e
```

Add this line to run renewal check twice daily:
```cron
0 0,12 * * * /usr/bin/certbot renew --quiet
```

Or add a systemd timer (recommended):

Create `/etc/systemd/system/certbot-renewal.timer`:
```ini
[Unit]
Description=Certbot Renewal Timer

[Timer]
OnCalendar=0/12:00:00
RandomizedDelaySec=3600
Persistent=true

[Install]
WantedBy=timers.target
```

Enable and start the timer:
```bash
sudo systemctl enable certbot-renewal.timer
sudo systemctl start certbot-renewal.timer
```

## Step 6: Verify SSL Certificate

1. **Check certificate in browser:**
   - Visit https://flopsmaster.com
   - Click the padlock icon
   - Should show "Connection is secure" with green padlock

2. **Test with OpenSSL:**
   ```bash
   openssl s_client -connect flopsmaster.com:443 -servername flopsmaster.com < /dev/null
   ```

3. **Test with SSL Labs:**
   - Visit: https://www.ssllabs.com/ssltest/analyze.html?d=flopsmaster.com
   - Should get at least an "A" rating

4. **Check certificate expiration:**
   ```bash
   sudo certbot certificates
   ```

## Troubleshooting

### Certificate Not Found:
- Check certificate location: `sudo ls -la /etc/letsencrypt/live/flopsmaster.com/`
- Verify domain name matches exactly

### Web Server Won't Start:
- Check web server logs: `sudo journalctl -u nginx` or `sudo journalctl -u apache2`
- Test configuration: `sudo nginx -t` or `sudo apache2ctl configtest`
- Check SSL certificate paths are correct

### Port 80/443 Already in Use:
- Check what's using the port: `sudo lsof -i :80` or `sudo lsof -i :443`
- Stop conflicting services

### DNS Not Propagated:
- Verify DNS: `dig flopsmaster.com` or `nslookup flopsmaster.com`
- Wait for DNS propagation (can take up to 48 hours)

### Renewal Fails:
- Check renewal logs: `sudo certbot renew --dry-run -v`
- Ensure web server is accessible on port 80 for verification
- Check firewall allows port 80 and 443

## Important Notes

1. **Certificate Location:**
   - Certificates are stored in: `/etc/letsencrypt/live/flopsmaster.com/`
   - `fullchain.pem` - Full certificate chain (use this)
   - `privkey.pem` - Private key
   - `chain.pem` - Intermediate certificate
   - `cert.pem` - Certificate only

2. **Certificate Expiration:**
   - Let's Encrypt certificates expire after 90 days
   - Auto-renewal runs twice daily
   - Renewal happens when certificate is within 30 days of expiration

3. **Rate Limits:**
   - Let's Encrypt has rate limits (50 certificates per registered domain per week)
   - Use `--dry-run` to test without hitting limits

4. **Backup Certificates:**
   - Backup `/etc/letsencrypt/` directory regularly
   - Keep private keys secure

## Quick Commands Reference

```bash
# Get certificate
sudo certbot certonly --standalone -d flopsmaster.com -d www.flopsmaster.com

# List certificates
sudo certbot certificates

# Renew all certificates
sudo certbot renew

# Test renewal (dry-run)
sudo certbot renew --dry-run

# Revoke certificate (if needed)
sudo certbot revoke --cert-path /etc/letsencrypt/live/flopsmaster.com/cert.pem

# Delete certificate (if needed)
sudo certbot delete --cert-name flopsmaster.com
```

