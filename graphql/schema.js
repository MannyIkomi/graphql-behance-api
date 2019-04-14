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
    created_on: { type: GraphQLInt }, //epoch date
    modified_on: { type: GraphQLInt }, //epoch date
    published_on: { type: GraphQLInt }, //epoch date
    url: { type: GraphQLString },
    slug: { type: GraphQLString },
    fields: { type: GraphQLList(GraphQLString) }, //as in creative field categories

    covers: { type: ProjectCovers },
    modules: { type: GraphQLList(ProjectModules) }
  })
})

const Portfolio = new GraphQLObjectType({
  name: 'Portfolio',
  fields: () => ({
    projects: {
      type: GraphQLList(Project),
      resolve: projects => {
        const ids = projects.map(project => project.id)
        return Promise.all(
          ids.map(id =>
            axios
              .get(
                `https://api.behance.net/v2/projects/${id}/projects?api_key=${BE_API_KEY}`
              )
              .then(response => response.data.project)
          )
        )
      }
    }
  })
})

const RootQuery = new GraphQLObjectType({
  name: 'RootQuery',
  fields: () => ({
    project: {
      type: Project,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (root, args) =>
        axios
          .get(
            `https://api.behance.net/v2/projects/${
              args.id
            }/projects?api_key=${BE_API_KEY}`
          )
          .then(response => response.data.project)
    },
    portfolio: {
      type: Portfolio,
      resolve: () =>
        axios
          .get(
            `https://api.behance.net/v2/users/${BE_USER_ID}/projects?api_key=${BE_API_KEY}`
          )
          .then(response => response.data.projects)
    }
  })
})

module.exports = new GraphQLSchema({
  query: RootQuery
})
