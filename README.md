Fastify Config Loader
=====================
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

### Install:
```bash
$ npm install fastify-config-loader --save
```

### How to use?
```javascript
const fastify = require('fastify')()
const configs = require('fastify-config-loader')
fastify.register(configs, { path: '[CONFIGS_DIRECTORY_PATH]' })

fastify.get('/', async (request, reply) => {
	console.log('Configs:', fastify.Configs) // => returns configs object
    return { hello: 'world' }
})
```

### How it works?
You have to put config files into `CONFIGS_DIRECTORY_PATH` which will pass as a `path` option into the plugin options. The directory includes json files which seperated with a dot for different environments.

```bash
- configs direcroy:
   |_ configs.json
   |_ configs.staging.json
   |_ configs.production.json
```
The main config file is `configs.json` and base on different environments other files will be marge into it.
for example if I set `NODE_ENV=production` the production config file will be concat to main configs file and returns as an object into my application.
You can also add a `configs.js` file to the configs directory. which will help to modify configs from json files with same keys. for example:

**configs.json**
```json
{
  "cors_whitelist": [
    "localhost:3000",
    "localhost:5000"
  ]
}
```

**configs.js**
```javascript
module.exports = {
  cors_whitelist: (data) => {
    // data will return localhost:3000 and localhost:5000 in an array
    return data
  }
}
```
