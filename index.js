const express = require('express')
const GraphQLHTTP = require('express-graphql')
// const env = require('./config')
const schema = require('./schema')

const app = express()

app.use(
  '/graphql',
  GraphQLHTTP({
    schema,
    graphiql: true //process.env === 'development' ? true : false
  })
)

// console.log(`Environment`, env)
const PORT = process.env.PORT || 4000
const NODE_ENV = process.env.NODE_ENV
app.listen(
  PORT,
  console.log(`Server listening on port ${PORT}, Environment: ${NODE_ENV}`)
)
