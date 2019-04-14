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

const BE_USER_ID = process.env.BE_USER_ID
const BE_API_KEY = process.env.BE_API_KEY

// console.log(process.env)
// ModuleType = union Image || Text ||

const ProjectCoversType = new GraphQLObjectType({
  name: 'Cover',
  fields: () => ({
    original: { type: GraphQLString },
    size_404: { type: GraphQLString, resolve: covers => covers['404'] },
    size_808: { type: GraphQLString, resolve: covers => covers['808'] }
  })
})

const ImageModuleSizes = new GraphQLObjectType({
  name: 'ImageSize',
  fields: () => ({
    original: { type: GraphQLString },
    size_1400: { type: GraphQLString, resolve: sizes => sizes['1400'] },
    disp: { type: GraphQLString }
  })
})

const ImageModule = new GraphQLObjectType({
  name: 'ImageModule',
  fields: () => ({
    project_id: { type: GraphQLInt },
    type: { type: GraphQLString },
    sizes: { type: ImageModuleSizes }
  })
})

const TextModule = new GraphQLObjectType({
  name: `TextModule`,
  fields: () => ({
    project_id: { type: GraphQLInt },
    type: { type: GraphQLString },
    text_plain: { type: GraphQLString },
    text: { type: GraphQLString }
  })
})

const ProjectModulesType = new GraphQLUnionType({
  name: 'ProjectModules',
  types: [ImageModule, TextModule],
  resolveType: value => {
    if (value.type === 'image') {
      return ImageModule
    }
    if (value.type === 'text') {
      return TextModule
    } else {
      return null
    }
  }
})

const ProjectType = new GraphQLObjectType({
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

    covers: { type: ProjectCoversType },
    modules: { type: GraphQLList(ProjectModulesType) }
  })
})

const PortfolioType = new GraphQLObjectType({
  name: 'Portfolio',
  fields: () => ({
    projects: {
      type: GraphQLList(ProjectType),
      resolve: (parent, args) => {
        console.log(parent)
        // const projects = axios
        //   .get(
        //     `https://api.behance.net/v2/users/${BE_USER_ID}/projects?api_key=${BE_API_KEY}`
        //   )
        //   .then(response => response.data.projects)
        console.log('PORTFOLIO', projects)
        return projects
      }
    }
  })
})

const RootQuery = new GraphQLObjectType({
  name: 'RootQuery',
  fields: () => ({
    project: {
      type: ProjectType,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, args) =>
        axios
          .get(
            `https://api.behance.net/v2/projects/${
              args.id
            }/projects?api_key=${BE_API_KEY}`
          )
          .then(response => response.data.project)
    },
    portfolio: {
      type: PortfolioType
    }
  })
})

module.exports = new GraphQLSchema({
  query: RootQuery
})
