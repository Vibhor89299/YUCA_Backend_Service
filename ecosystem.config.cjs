// pm2 process config for the Yuca backend API (YL-003).
// All runtime secrets (MONGO_URI, JWT_SECRET, RAZORPAY_*, CLOUDINARY_*, SMTP_*)
// come from the .env file on the VM — never put them here.
//
// instances: 1 is REQUIRED until the in-process order-cleanup cron is made
// stateless (see spec: make-backend-stateless-and-bounded). Cluster mode with
// >1 instance would double-run the cron.
module.exports = {
  apps: [
    {
      name: 'yuca-api',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '400M',
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
