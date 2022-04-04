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
  const reposToDeploy = 'all' //core.getInput('repos')

  if (reposToDeploy === 'all') {
    const repos = await octokit.rest.repos
      .listForOrg({
        org: 'fluffytal-es',
        type: 'private',
      })

    return repos.data.map(repo => ({ 
      name: repo.full_name,
      path: `resources/${determineFolder(repo.name)}/`
    }))
  }

  return [{ name: `FluffyTal-es/${reposToDeploy}` }]
}

(async () => {
  try {
    const r = await getReposToDeploy()
    core.setOutput('matrix', { include: r })
  } catch (error) {
    core.setFailed(error.message)
  }
})()


