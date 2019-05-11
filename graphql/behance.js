const axios = require('axios')

function Behance(userId, apiKey) {
  const defaultUser = userId
  const defaultApiKey = apiKey

  async function getPortfolio(behanceUser, behanceApiKey) {
    projectListing = await getProjectsList(
      behanceUser || defaultUser,
      behanceApiKey || defaultApiKey
    )
    // console.log('PROJECT LISTING', projectListing)
    const portfolio = await projectListing.map(project =>
      getProjectById(project.id)
    )
    return Promise.all(portfolio)
  }

  function getProjectsList(behanceUser, behanceApiKey) {
    return axios
      .get(
        `https://api.behance.net/v2/users/${behanceUser ||
          defaultUser}/projects?api_key=${behanceApiKey || defaultApiKey}`
      )
      .then(response => response.data.projects)
  }

  // function getProjectsWithModules(projects = [{}]) {
  //   return projects.then(projects =>
  //     projects.map(project => getProjectById(project.id))
  //   )
  // }

  function getProjectById(id, behanceApiKey) {
    // RETURNS A PROMISE
    return axios
      .get(
        `https://api.behance.net/v2/projects/${id}/projects?api_key=${behanceApiKey ||
          defaultApiKey}`
      )
      .then(response => response.data.project)
  }

  return {
    getPortfolio,
    getProjectsList,

    getProjectById
  }
}

module.exports = Behance
