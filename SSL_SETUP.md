# SSL/HTTPS Setup Guide for flopsmaster.com

## Common Hosting Platforms SSL Configuration

### 1. **Vercel** (Recommended - Automatic SSL)

Vercel automatically provides SSL certificates for all custom domains.

**Steps to enable SSL:**
1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Domains**
3. Add your domain: `flopsmaster.com` and `www.flopsmaster.com`
4. Update your DNS records as instructed by Vercel:
   - For apex domain: Add A record pointing to Vercel IPs
   - For www subdomain: Add CNAME record pointing to `cname.vercel-dns.com`
5. SSL certificate will be automatically issued (can take a few minutes to hours)
6. Force HTTPS: SSL is enabled by default on Vercel

**Deploy:**
```bash
npm install -g vercel
vercel --prod
```

### 2. **Netlify** (Automatic SSL)

Netlify automatically provides SSL certificates via Let's Encrypt.

**Steps to enable SSL:**
1. Go to your Netlify dashboard
2. Navigate to **Site settings** > **Domain management**
3. Add your domain: `flopsmaster.com`
4. Update your DNS records:
   - Add CNAME record: `flopsmaster.com` → `your-site.netlify.app`
   - Or A record for apex domain (check Netlify docs for IPs)
5. Go to **Site settings** > **Domain management** > **HTTPS**
6. Click **Verify DNS configuration** and then **Provision certificate**
7. Enable **Force HTTPS** in HTTPS settings

**Deploy:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### 3. **GitHub Pages** (Manual SSL Setup)

GitHub Pages supports SSL but requires configuration.

**Steps:**
1. Go to your repository settings
2. Navigate to **Pages** section
3. Under **Custom domain**, enter `flopsmaster.com`
4. Check **Enforce HTTPS** checkbox
5. GitHub will automatically provision SSL (may take up to 24 hours)
6. Update your DNS:
   - Add A records pointing to GitHub Pages IPs:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   - Or add CNAME: `flopsmaster.com` → `username.github.io`

**Note:** Custom domain SSL on GitHub Pages can take time to provision.

### 4. **Custom Server** (Manual SSL Setup)

If you're using a custom server (Nginx, Apache, etc.), you need to:

1. **Obtain SSL Certificate:**
   - Use Let's Encrypt (free): `certbot certonly --standalone -d flopsmaster.com`
   - Or purchase from a certificate authority

2. **Configure Web Server:**
   
   **Nginx example:**
   ```nginx
   server {
       listen 443 ssl http2;
       server_name flopsmaster.com www.flopsmaster.com;
       
       ssl_certificate /etc/letsencrypt/live/flopsmaster.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/flopsmaster.com/privkey.pem;
       
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers HIGH:!aNULL:!MD5;
       ssl_prefer_server_ciphers on;
       
       root /var/www/flopsmaster/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   
   server {
       listen 80;
       server_name flopsmaster.com www.flopsmaster.com;
       return 301 https://$server_name$request_uri;
   }
   ```
   
   **Apache example:**
   ```apache
   <VirtualHost *:443>
       ServerName flopsmaster.com
       ServerAlias www.flopsmaster.com
       
       SSLEngine on
       SSLCertificateFile /etc/letsencrypt/live/flopsmaster.com/fullchain.pem
       SSLCertificateKeyFile /etc/letsencrypt/live/flopsmaster.com/privkey.pem
       
       DocumentRoot /var/www/flopsmaster/dist
       
       <Directory /var/www/flopsmaster/dist>
           Options -Indexes +FollowSymLinks
           AllowOverride All
           Require all granted
       </Directory>
       
       RewriteEngine On
       RewriteBase /
       RewriteRule ^index\.html$ - [L]
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteRule . /index.html [L]
   </VirtualHost>
   
   <VirtualHost *:80>
       ServerName flopsmaster.com
       ServerAlias www.flopsmaster.com
       Redirect permanent / https://flopsmaster.com/
   </VirtualHost>
   ```

3. **Auto-renewal (Let's Encrypt):**
   ```bash
   # Add to crontab
   0 0 * * * certbot renew --quiet
   ```

## Troubleshooting SSL Issues

### Check SSL Certificate Status
- Use [SSL Labs SSL Test](https://www.ssllabs.com/ssltest/analyze.html?d=flopsmaster.com)
- Use browser developer tools: Check certificate details in Security tab

### Common Issues:

1. **"Not Secure" Warning:**
   - Certificate not installed correctly
   - Mixed content (HTTP resources on HTTPS page) - Check browser console
   - Certificate expired - Renew certificate
   - Domain mismatch - Ensure certificate covers correct domain

2. **SSL Certificate Not Trusted:**
   - Missing intermediate certificates
   - Certificate chain incomplete
   - Self-signed certificate (not recommended for production)

3. **HTTPS Redirect Not Working:**
   - Check server configuration for HTTP to HTTPS redirect
   - Verify DNS records point to correct server

4. **Mixed Content Warnings:**
   - Ensure all resources (images, scripts, stylesheets) use HTTPS
   - Use protocol-relative URLs: `//example.com/resource` or full HTTPS URLs
   - Check browser console for mixed content warnings

### Verify DNS Configuration

Check your DNS records:
```bash
# Check A record
dig flopsmaster.com A

# Check CNAME record
dig www.flopsmaster.com CNAME

# Check SSL certificate
openssl s_client -connect flopsmaster.com:443 -servername flopsmaster.com
```

## Quick Fix Checklist

- [ ] DNS records correctly configured
- [ ] SSL certificate installed and valid
- [ ] HTTPS enabled on hosting platform
- [ ] HTTP to HTTPS redirect configured
- [ ] No mixed content (all resources use HTTPS)
- [ ] Certificate covers both `flopsmaster.com` and `www.flopsmaster.com`
- [ ] Certificate not expired
- [ ] Web server configuration correct
- [ ] Firewall allows HTTPS traffic (port 443)

## Recommended: Use Vercel or Netlify

For easiest SSL setup, use **Vercel** or **Netlify**:
- Automatic SSL certificate provisioning
- Free SSL certificates via Let's Encrypt
- Automatic renewal
- Easy DNS configuration
- Built-in CDN and performance optimizations

Simply connect your domain in the dashboard and SSL will be automatically configured!

