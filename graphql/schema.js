const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLID,
  GraphQLSchema,
  GraphQLString,
  GraphQLInt,
  GraphQLUnionType,
  GraphQLNonNull
} = require('graphql')
// const { GraphQLJSON, GraphQLJSONObject } = require('graphql-type-json')

const axios = require('axios')
const { ProjectCovers, ProjectModules } = require('./types')

const BE_USER_ID = process.env.BE_USER_ID
const BE_API_KEY = process.env.BE_API_KEY

const Project = new GraphQLObjectType({
  name: `Project`,
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    name: {
      type: GraphQLString,
      resolve: project => project.name
    },
    description: { type: GraphQLString },
    created_on: { type: GraphQLInt }, //epoch date
    modified_on: { type: GraphQLInt }, //epoch date
    published_on: { type: GraphQLInt }, //epoch date
    url: { type: GraphQLString },
    slug: { type: GraphQLString },
    fields: { type: GraphQLList(GraphQLString) }, //as in creative field categories
    tags: { type: GraphQLList(GraphQLString) },
    covers: { type: ProjectCovers },
    modules: { type: GraphQLList(ProjectModules) }
  })
})

// const sniff = require('supersniff')

const RootQuery = new GraphQLObjectType({
  name: 'RootQuery',
  fields: () => ({
    projects: {
      type: GraphQLList(Project),
      args: {
        id: { type: GraphQLInt },
        slug: { type: GraphQLString }
      },
      resolve: () => {
        const portfolio = axios
          .get(
            `https://api.behance.net/v2/users/${BE_USER_ID}/projects?api_key=${BE_API_KEY}`
          )

          .then(response => response.data.projects)

        return portfolio.then(portfolio => {
          return portfolio.map(project =>
            axios
              .get(
                `https://api.behance.net/v2/projects/${
                  project.id
                }/projects?api_key=${BE_API_KEY}`
              )
              .then(response => response.data.project)
          )
        })
      }
    }
  })
})

module.exports = new GraphQLSchema({
  query: RootQuery
})
