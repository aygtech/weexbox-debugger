#! /usr/bin/env node
const program = require('commander')
const debug = require('./debug')

program
  .arguments('[source]')
  .description('调试')
  .action((source) => {
    debug.run(source)
  })

program.parse(process.argv)
