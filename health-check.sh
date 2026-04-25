#!/bin/bash

STATUS=$(curl -s https://kittik.furkedesigns.com/api/health | grep ok)

if [ -z "$STATUS" ]; then
  echo "$(date) - Backend DOWN → restarting..." >> /root/kittik-backend/health.log
  pm2 restart kittik-backend
else
  echo "$(date) - Backend OK" >> /root/kittik-backend/health.log
fi