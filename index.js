const { injectEnvironmentVariables } = require('./config')
injectEnvironmentVariables({ path: './config/.env', debug: true })

const { startApp } = require('./app.js')

startApp()
