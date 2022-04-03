const { Octokit } = require('@octokit/rest')
const core = require('@actions/core')

const octokit = new Octokit({
  auth: process.env.DEPLOY_TOKEN || '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'
})

const getReposToDeploy = async () => {
  const reposToDeploy = core.getInput('repos')

  if (reposToDeploy === 'all') {
    const repos = await octokit.rest.repos
      .listForOrg({
        org: 'fluffytal-es',
        type: 'private',
      })

    return repos.data.map(repo => repo.full_name)
  }

  return [`FluffyTal-es/${reposToDeploy}`]
}

(async () => {
  try {
    const r = getAllRepos()
    core.setOutput('matrix', r)
  } catch (error) {
    core.setFailed(error.message);
  }
})()


