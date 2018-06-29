'use strict';

const ServerlessOfflineDotEnv = require('../src/');

const serverless = {
  cli: {
    log: jest.fn(),
  },
  service: {
    provider: {
      environment: {
        MY_ENV: 'my.env',
      }
    },
    functions: {
      myfunction: {
        environment: {
          MY_FUNC: 'my.func',
        },
      },
    },
  }
}

it('overrides the env vars', async () => {
  await new ServerlessOfflineDotEnv(serverless, {'dotenv-path': `${__dirname}/.env`}).run();
  expect(serverless.service.provider.environment.MY_ENV).toBe('foo');
  expect(serverless.service.functions.myfunction.environment.MY_FUNC).toBe('bar');
});
