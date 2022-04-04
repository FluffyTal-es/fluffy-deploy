const { Octokit } = require('@octokit/rest')
const core = require('@actions/core')

const octokit = new Octokit({
  auth: process.env.DEPLOY_TOKEN || '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'
})

const determineFolder = (name) => {
  if (name.indexOf('job') !== -1) return '[jobs]'
  else if (name.indexOf('dev') !== -1) return '[dev]'
  else if (name.indexOf('configs') !== -1) return '[configs]'
  else return '[fluffy]'
}

const getReposToDeploy = async () => {
  const reposToDeploy = core.getInput('repos')

  if (reposToDeploy === 'all') {
    const repos = await octokit.rest.repos
      .listForOrg({
        org: 'fluffytal-es',
        type: 'private',
      })

    return repos.data.map(repo => ({ 
      qb: repo.name.replace('fluffy-', 'qb-'),
      name: repo.name,
      path: `resources/${determineFolder(repo.name)}/${repo.name}`
    }))
  }

  return [{ 
    qb: reposToDeploy.replace('fluffy-', 'qb-'),
    name: reposToDeploy, 
    path: `resources/${determineFolder(reposToDeploy)}/${reposToDeploy}` 
  }]
}

(async () => {
  try {
    const r = await getReposToDeploy()
    core.setOutput('matrix', { include: r })
  } catch (error) {
    core.setFailed(error.message)
  }
})()


