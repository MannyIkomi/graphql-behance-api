const { configEnvironmentVar } = require('./config')
configEnvironmentVar({ path: '/.env', silent: 'true' })

const { start } = require('./app.js')
start()
