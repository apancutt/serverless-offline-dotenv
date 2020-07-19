'use strict';

const ServerlessOfflineDotEnv = require('../src/');

const providerEnv = {
  provider: {
    environment: {
      MY_ENV: 'my.env',
    }
  },
};

const functionEnv = {
  functions: {
    myfunction: {
      environment: {
        MY_FUNC: 'my.func',
      },
    },
  },
};

const serverlessWithoutEnv = {
  cli: {
    log: jest.fn(),
  },
};

const serverlessWithProviderEnvOnly = {
  ...serverlessWithoutEnv,
  service: providerEnv,
};

const serverlessWithFunctionEnvOnly = {
  ...serverlessWithoutEnv,
  service: functionEnv,
};

const serverlessWithProviderEnvAndFunctionEnv = {
  ...serverlessWithoutEnv,
  service: {
    ...providerEnv,
    ...functionEnv,
  },
};

it('it works without any env', async () => {
  await new ServerlessOfflineDotEnv(serverlessWithoutEnv, { 'dotenv-path': `${__dirname}/.env` }).run();
});

it('it works with provider env only', async () => {
  await new ServerlessOfflineDotEnv(serverlessWithProviderEnvOnly, { 'dotenv-path': `${__dirname}/.env` }).run();
});

it('it works with function env only', async () => {
  await new ServerlessOfflineDotEnv(serverlessWithFunctionEnvOnly, { 'dotenv-path': `${__dirname}/.env` }).run();
});

it('it overrides custom env vars', async () => {
  const serverless = { ...serverlessWithProviderEnvAndFunctionEnv };
  await new ServerlessOfflineDotEnv(serverless, { 'dotenv-path': `${__dirname}/.env` }).run();
  expect(serverless.service.provider.environment.MY_ENV).toBe('foo');
  expect(serverless.service.functions.myfunction.environment.MY_FUNC).toBe('bar');
});

it('it overrides SLS env vars', async () => {
  const serverless = { ...serverlessWithProviderEnvAndFunctionEnv };
  await new ServerlessOfflineDotEnv(serverless, { 'dotenv-path': `${__dirname}/.env` }).run();
  expect(serverless.service.provider.environment.SLS_ACCOUNT_ID).toBe('123');
  expect(serverless.service.functions.myfunction.environment.SLS_ACCOUNT_ID).toBeUndefined();
});
