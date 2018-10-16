'use strict';

const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const fs = require('fs');

class ServerlessOfflineDotEnv {

  constructor(serverless, options) {

    this.serverless = serverless;
    this.path = options['dotenv-path'] || `${process.env.PWD}/.env`;
    this.serverless.service.provider.environment = this.serverless.service.provider.environment || {}

    this.hooks = {
      'before:offline:start:init': this.run.bind(this),
    };

  }

  run() {
    return new Promise((resolve) => {
      const log = (key, newValue, funcName) => {
        this.serverless.cli.log(`Overriding environment variable ${key} for ${funcName ? `${funcName}() function` : 'all functions'} with value from dotenv: ${newValue}`);
      };

      this.override(this.serverless.service.provider.environment, (key, newValue) => {
        log(key, newValue);
      });

      Object.keys(this.serverless.service.functions).forEach((funcName) => {
        if (this.serverless.service.functions[funcName].environment) {
          this.override(this.serverless.service.functions[funcName].environment, (key, newValue) => {
            log(key, newValue, funcName);
          });
        }
      });

      return resolve();
    });
  }

  dotenv() {
    if (!this._dotenv) {
      this._dotenv = {};

      if (fs.existsSync(this.path)) {
        this.serverless.cli.log(`Reading dotenv variables from ${this.path}`);

        this._dotenv = dotenvExpand(dotenv.config({ path: this.path })).parsed;
      }
    }

    return this._dotenv;
  }

  override(obj, callback) {
    const dotenv = this.dotenv();

    Object.keys(dotenv).forEach(key => {
      obj[key] = dotenv[key];

      callback(key, dotenv[key]);
    })
  }
}

module.exports = ServerlessOfflineDotEnv;
