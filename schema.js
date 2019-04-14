const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLID,
  GraphQLSchema,
  GraphQLString
} = require('graphql')
const axios = require('axios')

const BE_USER_ID = process.env.BE_USER_ID
const BE_API_KEY = process.env.BE_API_KEY

// ModuleType = union Image || Text ||

const ProjectType = new GraphQLObjectType({
  name: `Project`,
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString }
  })
})

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    projects: {
      type: new GraphQLList(ProjectType),
      resolve(parent, args) {
        axios
          .get(
            `https://api.behance.net/v2/users/22766641/projects?api_key=eQcCf78lw9BWiiVOtY2QFcstC0UadC7m`
          )
          .then(response => response.data)
      }
    }
  }
})

module.exports = new GraphQLSchema({
  query: RootQuery
})
