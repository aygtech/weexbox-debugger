#! /usr/bin/env node
const program = require('commander')

program
  .command('[source]')
  .description('调试')
  .action((source) => {
    
  })

program.parse(process.argv)
