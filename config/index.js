const dotenv = require('dotenv')

function injectEnvironmentVariables(options = {}) {
  const env = dotenv.config(options)
  if (env.error) {
    throw env.error
  }
}

module.exports = {
  injectEnvironmentVariables
}
