const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLID,
  GraphQLSchema,
  GraphQLString,
  GraphQLInt
} = require('graphql')
const axios = require('axios')

const BE_USER_ID = process.env.BE_USER_ID
const BE_API_KEY = process.env.BE_API_KEY

// console.log(process.env)
// ModuleType = union Image || Text ||

const ProjectCoversType = new GraphQLObjectType({
  name: 'Cover',
  fields: () => ({
    original: { type: GraphQLString },
    '404': { type: GraphQLString },
    '808': { type: GraphQLString }
  })
})

const ProjectType = new GraphQLObjectType({
  name: `Project`,
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    created_on: { type: GraphQLInt }, //epoch date
    modified_on: { type: GraphQLInt }, //epoch date
    published_on: { type: GraphQLInt }, //epoch date
    url: { type: GraphQLString },
    slug: { type: GraphQLString },
    fields: { type: GraphQLList(GraphQLString) } //as in creative field categories
    // covers
  })
})

const RootQuery = new GraphQLObjectType({
  name: 'RootQuery',
  fields: () => ({
    project: {
      type: ProjectType,
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, args) =>
        axios
          .get(
            `https://api.behance.net/v2/projects/${
              args.id
            }/projects?api_key=${BE_API_KEY}`
          )
          .then(response => response.data.project)
    }
  })
})

module.exports = new GraphQLSchema({
  query: RootQuery
})
