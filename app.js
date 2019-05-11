const express = require('express')
const GraphQLHTTP = require('express-graphql')
const Redis = require('ioredis')
const bodyParser = require('body-parser')
const cors = require('cors')
const helmet = require('helmet')

const schema = require('./graphql/schema')

function start() {
  const app = express()
  const redis = new Redis()

  const PORT = parseInt(process.env.PORT, 10)
  const NODE_ENV = process.env.NODE_ENV

  app.use(cors())
  app.use(helmet())
  app.use(bodyParser.json())

  if (NODE_ENV === 'development') {
    redis.on('connect', () => {
      console.log(
        `Redis Connected: Host = ${redis.options.host} Port = ${
          redis.options.port
        }`
      )
    })

    app.use('*', (req, res, next) => {
      console.log('Query Recevied: ' + JSON.stringify(req.body, null, 2))
      next()
    })

    // console.log('BEHANCE', [process.env.BE_USER_ID, process.env.BE_API_KEY])
  }
  const mountGraphql = GraphQLHTTP({
    schema,
    graphiql: NODE_ENV === 'development' ? true : false,
    context: { redis },
    customFormatErrorFn: error => ({
      message: error.message,
      locations: error.locations,
      stack: error.stack ? error.stack.split('\n') : [],
      path: error.path
    })
  })
  // app.post(
  //   '/graphql',
  //   GraphQLHTTP({
  //     schema
  //   })
  // )
  app.use('/graphql', mountGraphql)

  app.listen(
    PORT,
    console.log(`Server listening...\nPORT = ${PORT}\nNODE_ENV = ${NODE_ENV}`)
  )
}

module.exports = {
  start
}
