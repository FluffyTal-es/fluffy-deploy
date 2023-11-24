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

const getRemoteDestinationFolder = (name) => {
  if (name.indexOf('job') !== -1) return `[jobs]/${name}`
  else if (name.indexOf('dev') !== -1) return `[dev]/${name}`
  else if (name.indexOf('configs') !== -1) return '[configs]'
  else if (isResourceForSpawn(name)) return `[spawn]/${name}`
  else if (name == 'saltychat') return `[standalone]/${name}`
  else if (name == 'saltynui') return `[standalone]/${name}`
  else if (name == 'fluffy-mlos') return '[fluffy-mlos]/[fluffy-mlos]'
  else if (name == 'fluffy-mlos-frak') return '[fluffy-mlos]/[fluffy-mlos-frak]'
  else if (name == 'fluffy-mlos-mapping') return '[fluffy-mlos]/[fluffy-mlos-mapping]'
  else if (name == 'fluffy-mlos-gabz') return '[fluffy-mlos]/[fluffy-mlos-gabz]'
  else if (name.indexOf('fluffy-peds') !== -1) return '[fluffy-peds]'
  else if (name == 'fluffy-addonkleidung') return `[fluffy-addonkleidung]`
  else if (name == 'fluffy-car-addons') return '[fluffy-moddedcars]/[fluffy-car-addons]'
  else if (name == 'fluffy-car-pdmd') return '[fluffy-moddedcars]/[fluffy-car-pdmd]'
  else if (name == 'fluffy-car-event') return `[fluffy-moddedcars]/${name}`
  else if (name == 'illenium-appearance') return `[spawn]/${name}`
  else if (name == 'ox_lib') return `[spawn]/${name}`
  else if (name == 'fluffy-plasmagame') return `[fluffy]/[fluffy-plasmagame]`
  else if (name == 'fluffy-casino') return `[fluffy]/[fluffy-casino]`
  else if (name == 'fluffy-ps-housing') return `[fluffy]/[fluffy-ps-housing]`

  else return `[fluffy]/${name}`
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
      path: `resources/${determineFolder(repo.name)}/${repo.name}`,
      remotePath: `resources/${getRemoteDestinationFolder(repo.name)}`
    })).filter(repo => ['fluffy-deploy', 'fluffy-recipe', 'fluffy-auto-release'].indexOf(repo.name) === -1)
  }

  core.debug({
    qb: reposToDeploy.replace('fluffy-', 'qb-'),
    name: reposToDeploy,
    path: `resources/${determineFolder(reposToDeploy)}/${reposToDeploy}`,
    remotePath: `resources/${getRemoteDestinationFolder(reposToDeploy)}`
  })

  return [{
    qb: reposToDeploy.replace('fluffy-', 'qb-'),
    name: reposToDeploy,
    path: `resources/${determineFolder(reposToDeploy)}/${reposToDeploy}`,
    remotePath: `resources/${getRemoteDestinationFolder(reposToDeploy)}`
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
