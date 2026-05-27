module.exports = {
  apps: [{
    name: 'shriram-sip',
    script: 'npm',
    args: 'start',
    cwd: '/home/ubuntu/shriram-group-sip',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    max_memory_restart: '512M',
    restart_delay: 3000,
    watch: false,
  }],
}
