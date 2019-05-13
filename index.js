const { configEnvironmentVar } = require('./config')
configEnvironmentVar({ silent: 'true' })

const { start } = require('./app.js')
start()
