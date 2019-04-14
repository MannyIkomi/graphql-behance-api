const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLID,
  GraphQLSchema,
  GraphQLString,
  GraphQLInt,
  GraphQLUnionType
} = require('graphql')
const axios = require('axios')

const BE_USER_ID = process.env.BE_USER_ID
const BE_API_KEY = process.env.BE_API_KEY

// console.log(process.env)
// ModuleType = union Image || Text ||

const ProjectCoversType = new GraphQLObjectType({
  name: 'Cover',
  fields: () => ({
    original: { type: GraphQLString }
    // '404': { type: GraphQLString },
    // '808': { type: GraphQLString }
  })
})

const ImageSizesType = new GraphQLObjectType({
  name: 'ImageSize',
  fields: () => ({
    original: { type: GraphQLString },
    // '1400': { type: GraphQLString },
    disp: { type: GraphQLString }
  })
})

const ImageModule = new GraphQLObjectType({
  name: 'ImageModule',
  fields: () => ({
    project_id: { type: GraphQLInt },
    type: { type: GraphQLString },
    sizes: { type: ImageSizesType }
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
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    created_on: { type: GraphQLInt }, //epoch date
    modified_on: { type: GraphQLInt }, //epoch date
    published_on: { type: GraphQLInt }, //epoch date
    url: { type: GraphQLString },
    slug: { type: GraphQLString },
    fields: { type: GraphQLList(GraphQLString) }, //as in creative field categories
    // covers
    // modules
    modules: { type: GraphQLList(ProjectModulesType) }
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
