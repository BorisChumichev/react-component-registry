var thunkify = require('thunkify')
  , exec = thunkify(require('child_process').exec)
  , writeFile = thunkify(require('fs').writeFile)
  , log = require('./logger')('harvester')
  , co = require('co')
  , colors = require('colors')
  , inspect = require('util').inspect
  , WP_ENTRY_POINTS = './_components.json'

function* updateProjectToRemote(project) {
  log.info(`Updating ${project.logName} project files…`)
  project.dir = `./_clonedprj/${project.name}`
  try {
    yield exec(`[ -d ${project.dir} ] && cd ${project.dir} && git pull`)
  } catch(error) {
    log.info(`Looks like you are working with ${project.logName} for the first time. Cloning it…`)
    yield exec(`git clone ${project.repoUrl} ${project.dir}`)
  }
}

function* installDepsForProject(project) {
  log.info(`Installing dependencies for ${project.logName}, this may take a whale… 🐋`)
  yield exec(`cd ${project.dir} && npm i`)
}

function* getComponentsFromProject(project) {
  project.logName = project.name.blue
  yield updateProjectToRemote(project)
  yield installDepsForProject(project)
  return yield findComponentDefinitionsInProject(project)
}

function* findComponentDefinitionsInProject(project) {
  var searchResult = yield exec(`find ${project.dir} -type f -name _component.jsx`)
  return searchResult[0].trim().split('\n')
}

function* writeComponentEntriesForWebpack(pathsToComponents) {
  var components = {}
  pathsToComponents.forEach(function (path, i) {
    components['c' + i] = path
  })
  yield writeFile(WP_ENTRY_POINTS, JSON.stringify(components))
}

function* aggregateComponentsPathsFromProjects(projects) {
  for (var i = 0, pathsToComponents = []; i < projects.length; i++)
    pathsToComponents = pathsToComponents.concat(yield getComponentsFromProject(projects[i]))
  return pathsToComponents
}

function* writeComponentRequirerModule(pathsToComponents) {
  var requires = ''
  pathsToComponents.forEach(function (path, i) {
    requires += (i ? ', ' : '') + `require('.${path}')`
  })
  var requireString = `module.exports = [${requires}]`
  yield writeFile('./_components/index.js', requireString)
  log.success(requireString)
}

var harvest = co.wrap(function* (projects) {
  var pathsToComponents = yield aggregateComponentsPathsFromProjects(projects)
  yield writeComponentEntriesForWebpack(pathsToComponents)
  yield writeComponentRequirerModule(pathsToComponents)
})

harvest([
  {
    name: 'tomyam',
    repoUrl: 'git@github.com:dreamindustries/zvq-web-proxy.git',
  }
]).catch(function (error) {log.fail(error)})
