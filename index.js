const { injectEnvironmentVariables } = require('./config')
injectEnvironmentVariables({ path: './config/.env', debug: true })

const { start } = require('./app.js')

start()
