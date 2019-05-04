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
      type: GraphQLString
    },
    description: { type: GraphQLString },
    created_on: { type: GraphQLInt }, //epoch date
    modified_on: { type: GraphQLInt }, //epoch date
    published_on: { type: GraphQLInt }, //epoch date
    url: { type: GraphQLString },
    slug: {
      type: GraphQLString
    },
    fields: { type: GraphQLList(GraphQLString) }, //as in creative field categories
    tags: { type: GraphQLList(GraphQLString) },
    covers: { type: ProjectCovers },
    modules: { type: GraphQLList(ProjectModules) }
  })
})

const sniff = require('supersniff')

const RootQuery = new GraphQLObjectType({
  name: 'RootQuery',
  fields: () => ({
    projects: {
      type: GraphQLList(Project),
      args: {
        id: { type: GraphQLInt },
        slug: { type: GraphQLString }
      },
      resolve: (root, args) => {
        // base api call GETs projects[] with id's for the root query to manipulate
        const myProjects = axios
          .get(
            `https://api.behance.net/v2/users/${BE_USER_ID}/projects?api_key=${BE_API_KEY}`
          )
          .then(response => response.data.projects)

        if (args.id) {
          // GET a single project{} and wraps into an array[]
          return [getProjectById(args.id)]
          //
        } else if (args.slug) {
          return myProjects
            .then(projects =>
              projects.filter(
                project =>
                  project.slug.toUpperCase() === args.slug.toUpperCase()
              )
            )
            .then(matchedProject => [getProjectById(matchedProject[0].id)])
        } else {
          // all projects and modules

          return myProjects.then(projects =>
            projects.map(project => getProjectById(project.id))
          )
        }
      }
    }
  })
})

module.exports = new GraphQLSchema({
  query: RootQuery
})

function getProjectById(id) {
  // RETURNS A PROMISE
  return axios
    .get(
      `https://api.behance.net/v2/projects/${id}/projects?api_key=${BE_API_KEY}`
    )
    .then(response => response.data.project)
}
