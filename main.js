'use strict'

import { waterfall } from 'async'
import { readdir, statSync } from 'fs'
import fastifyPlugin from 'fastify-plugin'

const ServiceConfigs = async (fastify, { path }) => {
  this.env = process.env.NODE_ENV || ''
  this.path = path

  ServiceConfigs.init((err, configs) => {
    if (err) {
      throw new Error(err)
    }
    fastify.decorate('Configs', configs)
  })
}

ServiceConfigs.init = (callback) => {
  waterfall([
    ServiceConfigs.ReadConfigDirectory,
    ServiceConfigs.ValidateConfigFiles,
    ServiceConfigs.MergeConfigs
  ], callback)
}

ServiceConfigs.ReadConfigDirectory = (callback) => {
  readdir(this.path, (err, content = []) => {
    if (err) {
      return callback(err)
    }
    callback(null, content)
  })
}

ServiceConfigs.ValidateConfigFiles = (directortContent, callback) => {
  let configFiles = {
    json: {},
    js: {}
  }
  directortContent.sort()
  directortContent.forEach(itm => {
    let itmPath = `${this.path}/${itm}`
    let isValid = true
    isValid = isValid && statSync(itmPath).isFile()
    isValid = isValid && (itm.match(new RegExp(`^configs.(${this.env}).json$`, 'i')) !== null || (new RegExp(`^configs.?json|js$`, 'i')).test(itm))
    if (isValid) {
      configFiles[(new RegExp('.+?.json$', 'i').test(itm)) ? 'json' : 'js'][itm] = require(itmPath)
    }
  })
  callback(null, configFiles)
}

ServiceConfigs.MergeConfigs = (configFiles, callback) => {
  // merge json objects
  let configs = {}
  for (let file in configFiles.json) {
    configs = Object.assign({}, configs, configFiles.json[file])
  }
  // merge js objects
  let jsConfigs = {}
  for (let file in configFiles.js) {
    jsConfigs = Object.assign({}, jsConfigs, configFiles.js[file])
  }
  // find common keys between json config and js config and merge
  Object.keys(jsConfigs).forEach(key => {
    if (Object.keys(configs).indexOf(key) !== -1) {
      configs[key] = jsConfigs[key](configs[key])
    }
  })
  callback(null, configs)
}

export default fastifyPlugin(ServiceConfigs)
