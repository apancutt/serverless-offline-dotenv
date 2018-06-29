'use strict';

const fs = require('fs');

class ServerlessOfflineDotEnv {

  constructor(serverless) {

    this.serverless = serverless;

    this.hooks = {
      'before:offline:start:init': this.run.bind(this),
    };

  }

  run() {
    return new Promise((resolve) => {

      const log = (key, oldValue, newValue, funcName) => {
        this.serverless.cli.log(`Overriding environment variable ${key} for ${funcName ? `${funcName}() function` : 'all functions'} with value from dotenv: ${newValue}`);
      };

      this.override(this.serverless.service.provider.environment, (key, oldValue, newValue) => {
        log(key, oldValue, newValue);
      });

      Object.keys(this.serverless.service.functions).forEach((funcName) => {
        if (this.serverless.service.functions[funcName].environment) {
          this.override(this.serverless.service.functions[funcName].environment, (key, oldValue, newValue) => {
            log(key, oldValue, newValue, funcName);
          });
        }
      });

      return resolve();
    });
  }

  dotenv() {
    if (!this._dotenv) {

      this._dotenv = {};

      const path = process.env.DOTENV_PATH || `${process.env.PWD}/.env`;
      const encoding = process.env.DOTENV_ENCODING || 'utf-8';

      if (!fs.existsSync(path)) {

        this.serverless.cli.log(`Reading dotenv variables from ${path} (encoding: ${encoding})`);

        fs.readFileSync(path, {encoding}).split('\n').forEach((line) => {

          const matched = line.trim().match(/^([\w.-]+)\s*=\s*(.*)$/)
          if (!matched) {
            return;
          }

          let [, key, value] = matched;

          key = key.replace(/(^['"]|['"]$)/g, '').trim();
          value = value.replace(/(^['"]|['"]$)/g, '').trim();

          if ('#' === key[0]) {
            return;
          }

          this._dotenv[key] = value;

        });
      }
    }

    return this._dotenv;
  }

  override(obj, callback) {

    const dotenv = this.dotenv();

    Object.keys(obj).forEach((key) => {

      if (!dotenv.hasOwnProperty(key)) {
        return;
      }

      let oldValue = obj[key];
      obj[key] = dotenv[key];
      callback(key, oldValue, dotenv[key]);

    });

  }

}

module.exports = ServerlessOfflineDotEnv;
