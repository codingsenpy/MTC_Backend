module.exports = {
  apps: [{
    name: 'backend',
    script: 'server.js',
    cwd: '/root/MTC_Backend',
    instances: 1,
    env: {
      NODE_ENV: 'development',
      PORT: 5000,
      MONGODB_URI: 'mongodb+srv://Rzhiluxa:HJTD6gLOErtpRwPf@cluster0.iepde.mongodb.net/mohalla_tuition',
      JWT_SECRET: 'mohalla_tuition_secret_key_2023',
      CORS_ORIGIN: 'http://localhost:5173',
      EMAIL_USER: 'noreplymtc.2025@gmail.com',
      EMAIL_PASS: 'vgnnxjhbzutrfity'
    }
  }]
};
