'use strict';

const fs = require('fs');

class ServerlessOfflineDotEnv {

  constructor(serverless) {

    this.serverless = serverless;

    this.hooks = {
      'before:run:run': this.run,
      'before:offline:start': this.run,
      'before:offline:start:init': this.run,
      'before:invoke:local:invoke': this.run,
    };

  }

  run() {
    return new Promise((resolve) => {

      this.dotEnvVars = this.dotEnvVars || this.load();

      this.override(this.serverless.service.provider.environment, (key, value) => {
        this.serverless.cli.log(`Overriding env var ${key} for all functions with value from dotenv: "${value}"`);
      });

      Object.keys(this.serverless.service.functions).forEach((name) => {
        if (this.serverless.service.functions[name].environment) {
          this.override(overrides, this.serverless.service.functions[name].environment, (key, value) => {
            this.serverless.cli.log(`Overriding env var ${key} for ${name}() function with value from dotenv: "${value}"`);
          });
        }
      });

      return resolve();
    });
  }

  load() {

    const vars = {};

    fs.readFileSync('.env', {encoding: 'utf-8'}).split('\n').forEach((line) => {

      const matched = line.trim().match(/^([\w.-]+)\s*=\s*(.*)$/)
      if (!matched) {
        return;
      }

      const [, key, value] = matched;

      key = key.replace(/(^['"]|['"]$)/g, '').trim();
      value = value.replace(/(^['"]|['"]$)/g, '').trim();

      if ('#' === key[0]) {
        continue;
      }

      vars[key] = value;

    });

    return vars;
  }

  override(obj, callback) {
    Object.keys(obj).forEach((key) => {

      if (!this.dotEnvVars.hasOwnProperty(key)) {
        return;
      }

      obj[key] = this.dotEnvVars[key];
      callback(key, this.dotEnvVars[key]);

    });
  }

}

module.exports = ServerlessOfflineDotEnv;
