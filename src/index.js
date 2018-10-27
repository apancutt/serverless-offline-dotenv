'use strict';

const fs = require('fs');

class ServerlessOfflineDotEnv {

  constructor(serverless, options) {

    this.serverless = serverless;
    this.path = options['dotenv-path'] || `${process.env.PWD}/.env`;
    this.encoding = options['dotenv-encoding'] || `utf-8`;

    this.hooks = {
      'before:offline:start:init': this.run.bind(this),
    };

  }

  run() {
    return new Promise((resolve) => {

      const log = (key, oldValue, newValue, funcName) => {
        this.serverless.cli.log(`Overriding environment variable ${key} for ${funcName ? `${funcName}() function` : 'all functions'} with value from dotenv: ${newValue}`);
      };

      if (this.serverless.service) {

        if (this.serverless.service.provider && this.serverless.service.provider.environment) {
          this.override(this.serverless.service.provider.environment, (key, oldValue, newValue) => {
            log(key, oldValue, newValue);
          });
        }

        if (this.serverless.service.functions) {
          Object.keys(this.serverless.service.functions).forEach((funcName) => {
            this.override(this.serverless.service.functions[funcName].environment || {}, (key, oldValue, newValue) => {
              log(key, oldValue, newValue, funcName);
            });
          });
        }

      }

      return resolve();

    });
  }

  dotenv() {
    if (!this._dotenv) {

      this._dotenv = {};

      if (fs.existsSync(this.path)) {

        this.serverless.cli.log(`Reading dotenv variables from ${this.path} (encoding: ${this.encoding})`);

        fs.readFileSync(this.path, {encoding: this.encoding}).split('\n').forEach((line) => {

          const matched = line.trim().match(/^([\w.-]+)\s*=\s*(.*)$/)
          if (!matched) {
            return;
          }

          const [, key, value] = matched;

          // Ignore comment lines
          if ('#' === key[0]) {
            return;
          }

          // Remove quotes and whitespace
          this._dotenv[key] = value.replace(/(^['"]|['"]$)/g, '').trim();

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
