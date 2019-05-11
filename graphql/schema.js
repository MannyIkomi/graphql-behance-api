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
const Behance = require('./behance')

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
    fields: { type: GraphQLList(GraphQLString) }, //creative field categories
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
        // id: { type: GraphQLInt },
        slug: { type: GraphQLString }
      },
      resolve: async (root, args, context) => {
        const behance = Behance(process.env.BE_USER_ID, process.env.BE_API_KEY)
        const { redis } = context

        // check cache for projects
        const isCached = await redis
          .get('projects')
          // .then(sniff)
          .then(projects => {
            console.log('CHECKING CACHE')
            // console.log(JSON.parse(projects))
            return JSON.parse(projects)
          })

        function setCache(expires = 30) {
          // Side Effects
          console.log('SETTING CACHE')

          const myProjects = behance.getPortfolio()

          myProjects.then(projects => {
            redis.set('projects', JSON.stringify(projects))
            projects.forEach(project =>
              redis.set(project.slug, JSON.stringify(project))
            )
          })

          return myProjects
        }

        const cache = await (isCached ? isCached : setCache())

        if (args.slug) {
          const fromCache =
            isCached &&
            redis.get(args.slug).then(project => [JSON.parse(project)])

          return (
            fromCache ||
            setCache().then(projects =>
              projects.filter(
                project =>
                  project.slug.toUpperCase() === args.slug.toUpperCase()
              )
            )
          )
          // return (
          //   isCached
          //     .then(projects =>
          //       projects.filter(
          //         project =>
          //           project.slug.toUpperCase() === args.slug.toUpperCase()
          //       )
          //     )
          //     // .then(sniff)
          //     .then(matchedProject => [getProjectById(matchedProject[0].id)])
          // )
        } else {
          // all projects and modules
          console.log(cache)
          return cache
        }
      }
    }
  })
})

module.exports = new GraphQLSchema({
  query: RootQuery
})
