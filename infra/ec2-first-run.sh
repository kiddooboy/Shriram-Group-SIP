#!/usr/bin/env bash
# ============================================================================
# Shriram GSIP — EC2 one-time setup script
# Run this ONCE on the EC2 instance after the first git clone.
#
# Usage:
#   ssh ubuntu@3.111.115.37
#   cd ~/shriram-group-sip
#   bash infra/ec2-first-run.sh
#
# What it does:
#   1. Installs Nginx + Certbot (if not present)
#   2. Opens firewall ports 80 + 443
#   3. Copies the Nginx config
#   4. Issues a free SSL certificate from Let's Encrypt
#   5. Reloads Nginx
#   6. Ensures PM2 starts the app and survives reboots
# ============================================================================

set -euo pipefail
DOMAIN="shriramgsip.online"
EMAIL="admin@shriramgsip.online"       # change to your real email for cert expiry alerts
APP_DIR="$HOME/shriram-group-sip"
APP_PORT=3000

echo "========================================"
echo " Shriram GSIP — EC2 First-Run Setup"
echo " Domain : $DOMAIN"
echo " App dir: $APP_DIR"
echo "========================================"

# ── 0. Passwordless sudo for Nginx reload (needed by GitHub Actions deploy) ─
echo "→ Granting passwordless sudo for nginx/cp to deploy user..."
SUDO_LINE="$USER ALL=(ALL) NOPASSWD: /usr/sbin/nginx, /bin/systemctl reload nginx, /bin/systemctl restart nginx, /bin/cp, /usr/bin/certbot"
echo "$SUDO_LINE" | sudo tee /etc/sudoers.d/shriram-deploy > /dev/null
sudo chmod 0440 /etc/sudoers.d/shriram-deploy

# ── 1. System packages ────────────────────────────────────────────────────
echo "→ Updating apt and installing nginx + certbot..."
sudo apt-get update -qq
sudo apt-get install -y nginx certbot python3-certbot-nginx ufw

# ── 2. Firewall ──────────────────────────────────────────────────────────
echo "→ Opening ports 22, 80, 443..."
sudo ufw allow 22/tcp   2>/dev/null || true
sudo ufw allow 80/tcp   2>/dev/null || true
sudo ufw allow 443/tcp  2>/dev/null || true
sudo ufw --force enable 2>/dev/null || true

# ── 3. Make certbot challenge directory ───────────────────────────────────
sudo mkdir -p /var/www/certbot

# ── 4. Temporary HTTP-only nginx config (needed before certbot can run) ──
echo "→ Installing temporary HTTP config..."
sudo tee /etc/nginx/sites-available/$DOMAIN > /dev/null <<NGINX
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { proxy_pass http://127.0.0.1:$APP_PORT; proxy_set_header Host \$host; }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# ── 5. Issue SSL certificate ──────────────────────────────────────────────
echo "→ Requesting SSL certificate via Let's Encrypt..."
if [ ! -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then
    sudo certbot certonly \
        --webroot -w /var/www/certbot \
        -d $DOMAIN -d www.$DOMAIN \
        --email $EMAIL \
        --agree-tos \
        --non-interactive
    echo "✓ Certificate issued"
else
    echo "✓ Certificate already exists — skipping"
fi

# ── 6. Install final HTTPS nginx config ───────────────────────────────────
echo "→ Installing production HTTPS nginx config..."
sudo cp $APP_DIR/infra/nginx.conf /etc/nginx/sites-available/$DOMAIN
sudo nginx -t
sudo systemctl reload nginx
echo "✓ Nginx reloaded with HTTPS config"

# ── 7. Auto-renew cron (certbot adds its own, but ensure it's there) ──────
echo "→ Ensuring certbot renewal cron..."
(crontab -l 2>/dev/null | grep -q certbot) || \
    (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | crontab -
echo "✓ Cert auto-renewal configured"

# ── 8. PM2 startup ────────────────────────────────────────────────────────
echo "→ Ensuring PM2 app is running and set to auto-start..."
cd $APP_DIR
pm2 describe shriram-sip >/dev/null 2>&1 || \
    pm2 start npm --name shriram-sip -- start
pm2 save
pm2 startup | grep "sudo" | bash || true
echo "✓ PM2 configured"

echo ""
echo "========================================"
echo " ✓ Setup complete!"
echo ""
echo " Visit: https://$DOMAIN"
echo " Admin: https://$DOMAIN/api/leads"
echo "========================================"
