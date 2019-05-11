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
      type: GraphQLString,
      resolve: parent => parent.slug.toLowerCase()
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

        // check redis for projects cache in memory
        const isCached = await redis
          .get('projects')

          .then(projects => {
            console.log('CHECKING CACHE')

            return JSON.parse(projects)
          })

        function setCache(untilExpiration = 300) {
          // 5mins * per60seconds = 300 seconds
          // Side Effects
          // call behance, set cache, return all projects in portfolio

          console.log('SETTING CACHE')

          const myProjects = behance.getPortfolio()
          // https://github.com/luin/ioredis#pipelining
          myProjects.then(projects => {
            // save entire JSON blob into redis
            // redis.set('projects', JSON.stringify(projects))
            // redis.expire('projects', untilExpiration)
            redis
              .pipeline()
              .set('projects', JSON.stringify(projects))
              .expire('projects', untilExpiration)
              .exec()

            projects.forEach(project => {
              // save each project JSON blob into redis seperately
              // redis.set(project.slug, JSON.stringify(project))
              // redis.expire(project.slug, untilExpiration)
              redis
                .pipeline()
                .set(project.slug.toLowerCase(), JSON.stringify(project))
                .expire(project.slug.toLowerCase(), untilExpiration)
                .exec()
            })
          })

          return myProjects // PROMISE
        }

        if (args.slug) {
          console.log(args.slug)
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
        } else {
          // all projects and modules
          const cache = await (isCached ? isCached : setCache())

          return cache
        }
      }
    }
  })
})

module.exports = new GraphQLSchema({
  query: RootQuery
})
