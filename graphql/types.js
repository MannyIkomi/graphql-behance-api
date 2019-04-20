const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLUnionType
} = require('graphql')

const ProjectCovers = new GraphQLObjectType({
  name: 'Cover',
  fields: () => ({
    original: { type: GraphQLString },
    _404: { type: GraphQLString, resolve: covers => covers['404'] },
    _808: { type: GraphQLString, resolve: covers => covers['808'] }
  })
})

const ImageModuleSizes = new GraphQLObjectType({
  name: 'ImageSize',
  fields: () => ({
    original: { type: GraphQLString },
    _1400: { type: GraphQLString, resolve: sizes => sizes['1400'] },
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

const ProjectModules = new GraphQLUnionType({
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

module.exports = {
  ProjectCovers,
  ProjectModules,
  TextModule,
  ImageModule,
  ImageModuleSizes,
  ProjectCovers
}
