# serverless-offline-dotenv

Override environment variables configured in `serverless.yml` with any values
provided in a `.env` file located at the root of your project.

Both global and function-specific environment variables are overridden.

This plugin is intended for local development only, and is therefore only
invoked on `serverless offline start`.

## Installation

Install the plugin with NPM:

```bash
npm install --save-dev serverless-offline-dotenv
```

Add the plugin to your `serverless.yml` file:

```yaml
plugins:
    - serverless-offline-ssm
    - serverless-offline
```

It is important that the `serverless-offline-ssm` plugin is loaded before
`serverless-offline`.
