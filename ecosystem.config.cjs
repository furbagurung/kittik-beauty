module.exports = {
  apps: [
    {
      name: "kittik-backend",
      script: "npm",
      args: "run start:server",
      cwd: "/root/kittik-backend",
      env: {
        NODE_ENV: "production",
      },
      autorestart: true,
      max_restarts: 5,
      restart_delay: 3000,
    },
    {
      name: "kittik-frontend",
      script: "npm",
      args: "run start",
      cwd: "/root/kittik-backend/admin",
      env: {
        NODE_ENV: "production",
      },
      autorestart: true,
      max_restarts: 5,
      restart_delay: 3000,
    },
  ],
};
