const { api } = require('../index')
const ip = require('ip').address()
const path = require('path')
const uuid = require('uuid')
const detect = require('detect-port')
const compile = require('@weexbox/builder')
const chalk = require('chalk')

module.exports = {
  async run(source) {
    const options = {}
    let devtoolOptions = await transformOptions(options)
    let shouldReload = false
    if (source) {
      await compile(
        source,
        path.join(__dirname, '../frontend/public/weex'), 
        {
          watch: true,
          filename: '[name].js',
          web: false,
          config: options.config || options.c,
          ip: devtoolOptions.ip,
          port: devtoolOptions.port,
          BUNDLE_DIRECTORY: 'public/weex'
        },
        async (error, output, json) => {
          let bundles = []
          if (error) {
            console.log(chalk.red(Array.isArray(error) ? error.join('\n') : error))
          }
          else {
            bundles = json.assets.map(asset => {
              let entry
              let date = new Date()
              const formateTime = (value) => {
                return value < 10 ? '0' + value : value
              }
              if (/\./.test(source)) {
                entry = path.resolve(source)
              } else {
                entry = path.resolve(source, asset.name.replace('.js', '.vue'))
              }
              return {
                updateTime: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDay()} ${formateTime(date.getHours())}:${formateTime(date.getMinutes())}:${formateTime(date.getSeconds())}`,
                output: `http://${ip}:${devtoolOptions.port}/weex/${asset.name}?bundleType=vue`,
                size: (asset.size / 1024).toFixed(0),
                time: json.time,
                entry: entry
              }
            })
          }
          if (!shouldReload) {
            shouldReload = true
            await api.startDevtoolServer(bundles, devtoolOptions)
          } else {
            api.reload()
          }
        }
      )
    } else {
      await api.startDevtoolServer([], devtoolOptions)
    }
  }
}

const transformOptions = async (options) => {
  let defaultPort = await detect(8089)
  return {
    ip: options.host,
    port: options.port || options.p || defaultPort,
    channelId: options.channelid || uuid(),
    manual: options.manual,
    remoteDebugPort: options.remoteDebugPort
  }
}