module.exports = {
  apps : [{
    name: "auth-provider",
    script: "./src/server.js",
    env: {
      NODE_ENV: "production",
      PORT: 3005,
      ROUTE_PREFIX: "/auth"
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
