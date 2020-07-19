'use strict';

const fs = require('fs');

class ServerlessOfflineDotEnv {

  constructor(serverless, options) {

    this.serverless = serverless;
    this.path = options['dotenv-path'] || `${process.env.PWD}/.env`;
    this.encoding = options['dotenv-encoding'] || 'utf-8';

    this.hooks = {
      'before:offline:start:init': this.run.bind(this),
    };

  }

  run() {

    this.serverless.service = this.serverless.service || {};
    this.serverless.service.provider = this.serverless.service.provider || {};
    this.serverless.service.provider.environment = this.serverless.service.provider.environment || {};

    const { custom, sls } = this.dotenv();

    // SLS vars are always sent to the provider so that SLS internals can bind them to the event
    // See: https://github.com/dherault/serverless-offline#environment-variables
    this.override(this.serverless.service.provider.environment, sls, undefined, true);

    this.override(this.serverless.service.provider.environment, custom);

    Object.keys(this.serverless.service.functions || {}).forEach((fn) => {
      this.serverless.service.functions[fn].environment = this.serverless.service.functions[fn].environment || {};
      this.override(this.serverless.service.functions[fn].environment, custom, fn);
    });

  }

  dotenv() {

    if (!fs.existsSync(this.path)) {
      this.serverless.cli.warn(`A dotenv file was not found at ${this.path}`);
      return {};
    }

    this.serverless.cli.log(`Reading dotenv variables from ${this.path} (${this.encoding})`);

    return fs.readFileSync(this.path, { encoding: this.encoding }).split('\n').reduce((accumulator, line) => {

      const match = line.trim().match(/^([\w.-]+)\s*=\s*(.*)$/)
      if (!match) {
        return accumulator;
      }

      let [ , key, value ] = match;

      // Ignore comment lines
      if (key.startsWith('#')) {
        return accumulator;
      }

      // Remove quotes and whitespace
      value = value.replace(/(^['"]|['"]$)/g, '').trim();

      const type = key.startsWith('SLS_') ? 'sls' : 'custom';

      return {
        ...accumulator,
        [type]: {
          ...accumulator[type],
          [key]: value,
        },
      };

    }, { custom: {}, sls: {} });

  }

  override(previous, next, fn = undefined, force = false) {
    Object.entries(next).forEach(([ key, value ]) => {
      if (force || key in previous) {
        this.serverless.cli.log(`Setting ${key} for ${fn ? `${fn} function` : 'all functions'} to value from dotenv: "${value}"`);
        previous[key] = value;
      }
    });
  }

}

module.exports = ServerlessOfflineDotEnv;
