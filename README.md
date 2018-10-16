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
    - serverless-offline-dotenv
    - serverless-offline
```

It is important that the `serverless-offline-dotenv` plugin is loaded before
`serverless-offline`.

## Creating a `.env` file

Create a file at the root of your project named `.env` containing the
environment variables that you want to override locally.

```
# /path/to/project/.env

DB_HOSTNAME=127.0.0.1
DB_USER=me
# Lines starting with a hash are treated as comments
DB_PASSWORD=secret
```

Your `.env` file may contain sensitive information so you should add it to your
`.gitignore` file.

You might want to provide a `.env.example` template to make setup easier for
other developers.

```
# /path/to/project/.env.example

DB_HOSTNAME=127.0.0.1
DB_USER=<your local database username here>
DB_PASSWORD=<your local database password here>
```

Developers can then create a `.env` file from the template by running
`cp .env{.example,}` and make the appropriate changes.
