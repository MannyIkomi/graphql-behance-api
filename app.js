const express = require('express')
const GraphQLHTTP = require('express-graphql')
const schema = require('./graphql/schema')

function startApp() {
  const app = express()

  const PORT = process.env.PORT || 4000
  const NODE_ENV = process.env.NODE_ENV

  app.use(
    '/graphql',
    GraphQLHTTP({
      schema,
      graphiql: NODE_ENV === 'development' ? true : false
    })
  )

  app.listen(
    PORT,
    console.log(`Server listening on Port ${PORT}, NODE_ENV: ${NODE_ENV}`)
  )
}

module.exports = {
  startApp
}
