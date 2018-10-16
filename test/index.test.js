'use strict';

const ServerlessOfflineDotEnv = require('../src/');

const serverless = {
  cli: {
    log: jest.fn(),
  },
  service: {
    provider: {
      environment: {
        MY_OVERRIDE_ENV: 'my.env',
      }
    },
    functions: {
      myfunction: {
        environment: {
          MY_OVERRIDE_FUNC: 'my.func',
        },
      },
    },
  }
}

it('overrides the env vars', async () => {
  await new ServerlessOfflineDotEnv(serverless, {'dotenv-path': `${__dirname}/.env`}).run();
  expect(serverless.service.provider.environment.MY_OVERRIDE_ENV).toBe('foo');
  expect(serverless.service.functions.myfunction.environment.MY_OVERRIDE_FUNC).toBe('bar');
});

it('inserts new env vars', async () => {
  await new ServerlessOfflineDotEnv(serverless, {'dotenv-path': `${__dirname}/.env`}).run();
  expect(serverless.service.provider.environment.MY_INSERT_ENV).toBe('baz');
  expect(serverless.service.provider.environment.MY_INSERT_FUNC).toBe('qux');
});
