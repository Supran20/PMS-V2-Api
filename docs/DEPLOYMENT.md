# RSTPMS Deployment Documentation

## Server Information

| Property | Value |
|----------|-------|
| Server IP | `206.189.136.214` |
| Domain | `rstpms.realstorytime.com` |
| SSH Alias | `bi-rstpms` |
| OS | Ubuntu 24.04.3 LTS |
| App Directory | `/srv/app/RSTPMS` |

## Technology Stack

- **Runtime**: Node.js v24.13.1 (via nvm 0.40.4)
- **Package Manager**: pnpm v10.20.0
- **Process Manager**: PM2 v6.0.14
- **Database**: PostgreSQL 16
- **Web Server**: Nginx 1.24.0
- **SSL**: Let's Encrypt (Certbot)

---

## Initial Server Setup

### 1. Install NVM and Node.js

```bash
ssh bi-rstpms

# Install nvm (if not installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.nvm/nvm.sh

# Install Node.js LTS
nvm install --lts
```

### 2. Install PM2 and pnpm

```bash
npm install -g pm2 pnpm

# Enable PM2 startup on boot
pm2 startup
pm2 save
```

### 3. Install pm2-logrotate

```bash
pm2 install pm2-logrotate

# Default configuration:
# - max_size: 10M
# - retain: 30 files
# - rotateInterval: 0 0 * * * (daily at midnight)
```

---

## PostgreSQL Setup

### 1. Install PostgreSQL

```bash
apt update && apt install -y postgresql postgresql-contrib
```

### 2. Create Database and User

```bash
# Create database
sudo -u postgres createdb rstpms

# Create user with password
sudo -u postgres psql -c "CREATE USER rstpms WITH PASSWORD 'your_password_here';"

# Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE rstpms TO rstpms;"
sudo -u postgres psql -d rstpms -c "GRANT ALL ON SCHEMA public TO rstpms;"
```

---

## Application Deployment

### 1. Clone Repository

```bash
cd /srv/app
git clone git@github.com:broadwayinfosys1/RSTPMS.git
cd RSTPMS
```

### 2. Configure Environment

Create `.env` file:

```bash
cat > .env << 'EOF'
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rstpms
DB_USER=rstpms
DB_PASSWORD=your_password_here
DB_DIALECT=postgres

# Server Configuration
PORT=3000
NODE_ENV=production

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
EOF
```

### 3. Install Dependencies and Build

```bash
pnpm install
pnpm build
```

### 4. Run Migrations and Seeds

```bash
pnpm migrate
pnpm seed
```

### 5. Start Application with PM2

```bash
pm2 start dist/server.js --name rstpms
pm2 save
```

---

## Nginx Configuration

### 1. Install Nginx

```bash
apt install -y nginx
```

### 2. Create Site Configuration

```bash
cat > /etc/nginx/sites-available/rstpms << 'EOF'
server {
    listen 80;
    server_name rstpms.realstorytime.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
```

### 3. Enable Site

```bash
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/rstpms /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## SSL Certificate (Let's Encrypt)

### 1. Install Certbot

```bash
apt install -y certbot python3-certbot-nginx
```

### 2. Obtain Certificate

```bash
certbot --nginx -d rstpms.realstorytime.com --non-interactive --agree-tos -m admin@realstorytime.com
```

### 3. Verify Auto-Renewal

```bash
systemctl list-timers | grep certbot
certbot renew --dry-run
```

Certificate auto-renews via systemd timer. Expires every 90 days.

---

## GitHub Actions CI/CD

The repository includes automated deployment via GitHub Actions.

### Workflow File: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Server

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /srv/app/RSTPMS
            git pull origin main
            source ~/.nvm/nvm.sh
            pnpm install
            pnpm build
            pnpm migrate
            pm2 restart rstpms
            pm2 save
```

### Required GitHub Secrets

Configure at: `https://github.com/broadwayinfosys1/RSTPMS/settings/secrets/actions`

| Secret Name | Value |
|-------------|-------|
| `SERVER_HOST` | `206.189.136.214` |
| `SERVER_USER` | `root` |
| `SSH_PRIVATE_KEY` | SSH private key content |

---

## Useful Commands

### PM2 Commands

```bash
pm2 status              # Check app status
pm2 logs rstpms         # View logs
pm2 restart rstpms      # Restart app
pm2 stop rstpms         # Stop app
pm2 delete rstpms       # Remove from PM2
pm2 monit               # Monitor dashboard
```

### Database Commands

```bash
# Connect to database
sudo -u postgres psql -d rstpms

# Run migrations
pnpm migrate

# Run seeds
pnpm seed

# Undo last migration
npx sequelize-cli db:migrate:undo
```

### Nginx Commands

```bash
nginx -t                    # Test configuration
systemctl reload nginx      # Reload configuration
systemctl restart nginx     # Restart nginx
systemctl status nginx      # Check status
```

### SSL Commands

```bash
certbot certificates        # List certificates
certbot renew              # Renew certificates
certbot renew --dry-run    # Test renewal
```

---

## Troubleshooting

### App not starting

```bash
pm2 logs rstpms --lines 50    # Check recent logs
pm2 restart rstpms --update-env  # Restart with updated env
```

### Database connection failed

```bash
systemctl status postgresql   # Check PostgreSQL status
sudo -u postgres psql -c "\l" # List databases
```

### Nginx 502 Bad Gateway

```bash
pm2 status                    # Ensure app is running
curl http://localhost:3000    # Test direct access
nginx -t                      # Check nginx config
```

### SSL certificate issues

```bash
certbot certificates          # Check certificate status
certbot renew --force-renewal # Force renewal
```

---

## File Structure on Server

```
/srv/app/RSTPMS/
├── .env                    # Environment variables
├── dist/                   # Compiled JavaScript
├── node_modules/           # Dependencies
├── database/
│   ├── migrations/         # Database migrations
│   └── seeders/            # Database seeders
├── src/                    # TypeScript source
└── uploads/                # Uploaded media files

/etc/nginx/sites-available/rstpms    # Nginx config
/etc/letsencrypt/live/rstpms.realstorytime.com/   # SSL certificates
/root/.pm2/logs/                      # PM2 logs
```

---

## Maintenance Schedule

| Task | Frequency | Command |
|------|-----------|---------|
| SSL Renewal | Auto (every 60 days) | `certbot renew` |
| Log Rotation | Daily | pm2-logrotate (automatic) |
| Database Backup | Weekly (recommended) | `pg_dump rstpms > backup.sql` |
| System Updates | Monthly | `apt update && apt upgrade` |

---

*Last Updated: February 20, 2026*
