const dotenv = require('dotenv')

const env = dotenv.config({ path: './config/.env' })

if (env.error) {
  throw env.error
}

module.exports = {
  env
}
