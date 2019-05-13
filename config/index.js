const dotenv = require('dotenv')

function configEnvironmentVar(options = {}) {
  const env = dotenv.config(options)
  if (env.error) {
    console.error(env.error)
  }
}

module.exports = {
  configEnvironmentVar
}
