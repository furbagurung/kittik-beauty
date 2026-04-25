#!/bin/bash
set -e

export NVM_DIR="/root/.nvm"
source "$NVM_DIR/nvm.sh"
nvm use 20

export PATH="/root/.nvm/versions/node/v20.20.2/bin:$PATH"

cd /root/kittik-backend

echo "Using Node:"
which node
node -v
which npm
npm -v

echo "Pulling latest code..."
git pull origin main

echo "Installing backend dependencies..."
npm install

echo "Generating Prisma client..."
npx prisma generate

echo "Installing admin dependencies..."
cd /root/kittik-backend/admin
npm install

echo "Building admin..."
npm run build

echo "Restarting PM2 apps..."
cd /root/kittik-backend
pm2 restart ecosystem.config.cjs --update-env
pm2 save

echo "Deployment complete."