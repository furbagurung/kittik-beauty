#!/bin/bash
set -e

export NVM_DIR="/root/.nvm"
source "$NVM_DIR/nvm.sh"
nvm use 20
export PATH="/root/.nvm/versions/node/v20.20.2/bin:$PATH"

APP_DIR="/root/kittik-backend"
BACKUP_DIR="/root/kittik-backend-backup-$(date +%F-%H-%M-%S)"

cd "$APP_DIR"

echo "Using Node:"
node -v
npm -v

echo "Creating backup..."
cp -a "$APP_DIR" "$BACKUP_DIR"

echo "Pulling latest code..."
git fetch origin main
git reset --hard origin/main
git clean -fd -e .env -e uploads/

echo "Installing backend dependencies..."
npm install

echo "Generating Prisma client..."
npx prisma generate

echo "Installing admin dependencies..."
cd "$APP_DIR/admin"
npm install

echo "Building admin..."
npm run build

echo "Reloading PM2 apps..."
cd "$APP_DIR"
pm2 reload ecosystem.config.cjs --update-env
pm2 save

echo "Running health check..."
sleep 5

STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://kittik.furkedesigns.com/api/health)

if [ "$STATUS" != "200" ]; then
  echo "Health check failed. Rolling back..."

  pm2 stop all || true
  rm -rf "$APP_DIR"
  mv "$BACKUP_DIR" "$APP_DIR"

  cd "$APP_DIR"
  pm2 reload ecosystem.config.cjs --update-env
  exit 1
fi

echo "Health check passed"

echo "Cleaning old backups..."
ls -dt /root/kittik-backend-backup-* 2>/dev/null | tail -n +6 | xargs -r rm -rf

echo "Deployment complete."