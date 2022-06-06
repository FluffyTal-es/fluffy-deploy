const { Octokit } = require('@octokit/rest')
const core = require('@actions/core')

const octokit = new Octokit({
  auth: core.getInput('token')
})

const isResourceForSpawn = (name) => {
  if ([
    'houses', 
    'apartments', 
    'spawn', 
    'multicharacter', 
    'clothing'].indexOf(name.replace('fluffy-', '')) !== -1) {
      return true
    }

  return false
}

const determineFolder = (name) => {
  if (name.indexOf('job') !== -1) return '[jobs]'
  else if (name.indexOf('dev') !== -1) return '[dev]'
  else if (name.indexOf('configs') !== -1) return '[configs]'
  else if (isResourceForSpawn(name)) return '[spawn]'
  else if (name == 'saltychat') return '[standalone]'
  else return '[fluffy]'
}

const getReposToDeploy = async () => {
  const reposToDeploy = core.getInput('repos')

  if (reposToDeploy === 'all') {
    const repos = await octokit.rest.repos
      .listForOrg({
        org: 'FluffyTal-es',
        type: 'private',
        per_page: 1000
      })

    return repos.data.map(repo => ({ 
      qb: repo.name.replace('fluffy-', ''),
      name: repo.name,
      path: `resources/${determineFolder(repo.name)}/${repo.name}`
    })).filter(repo => ['fluffy-deploy', 'fluffy-recipe', 'fluffy-auto-release'].indexOf(repo.name) === -1)
  }

  core.debug({ 
    qb: reposToDeploy.replace('fluffy-', 'qb-'),
    name: reposToDeploy, 
    path: `resources/${determineFolder(reposToDeploy)}/${reposToDeploy}` 
  })

  return [{ 
    qb: reposToDeploy.replace('fluffy-', 'qb-'),
    name: reposToDeploy, 
    path: `resources/${determineFolder(reposToDeploy)}/${reposToDeploy}` 
  }]
}

(async () => {
  try {
    const r = await getReposToDeploy()
    core.debug(r)
    return core.setOutput('matrix', { include: r })
  } catch (error) {
    core.setFailed(error.message)
  }
})()
