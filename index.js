const { injectEnvironmentVariables } = require('./config')
injectEnvironmentVariables({ path: './config/.env' })

const { start } = require('./app.js')
start()
