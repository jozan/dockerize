#! /usr/bin/env node
const path = require('path')
const fs = require('fs-extra')
const program = require('commander')
const chalk = require('chalk')

const dockerComposeConfig = require('./templates/dockerCompose')
const nginxConfig = require('./templates/nginx')

try {
  program
    .version('0.0.1', '-v, --version')
    .option('--verbose', 'verbose output')
    .option('-u, --url [url]', 'development url of your app', 'myapp.tunk.io')
    .option(
      '-p, --port [port]',
      'port of your frontend app',
      arg => {
        const port = Number(arg)
        if (typeof port !== 'number' || isNaN(port)) {
          throw new Error(
            `Port (-p, --port [port]) must be a number, ${typeof arg} (${arg}) was given.`
          )
        }

        return port
      },
      3000
    )
    .parse(process.argv)

  const options = {
    port: program.port,
    url: program.url
  }

  const generatedConfigs = [nginxConfig, dockerComposeConfig].map(config => ({
    path: path.resolve(config.path, config.filename),
    template: config.template(options)
  }))

  // Abort if any file already exists
  generatedConfigs.forEach(config => {
    if (fs.existsSync(config.path)) {
      throw new Error(
        `Configuration file exists, delete it first to proceed: \n    ${config.path}\n`
      )
    }
  })

  generatedConfigs.forEach(config => {
    fs.outputFileSync(config.path, config.template)
  })

  console.log(chalk.white('All docker configuration files generated with given args:'))
  console.log(chalk.white(' - port: %s'), program.port)
  console.log(chalk.white(' - url:  %s\n\n'), program.url)

  console.log(chalk.white.bold('Run docker-compose:'))
  console.log(chalk.blue('    docker-compose up\n'))
  console.log(chalk.white.bold('View your app in browser:'))
  console.log(chalk.blue('    http://%s'), program.url)
} catch (error) {
  if (program.verbose) {
    console.log(chalk.red(`${error.stack}`))
  } else {
    console.log(chalk.red(`Error: ${error.message}`))
  }
  process.exit(1)
}
