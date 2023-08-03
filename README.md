# blockscout-status

A script for monitoring the status of blockscout features that Valora depends on.

Intended for cLabs to be able to deploy as a cloud function that could be used for automated health checks and alerting.

## What's in the stack?

- [TypeScript](https://www.typescriptlang.org/)
- Unit testing with [Jest](https://jestjs.io)
- Linting with [ESLint](https://eslint.org/), configured with [@valora/eslint-config-typescript](https://github.com/valora-inc/eslint-config-typescript)
- Automatic code formating with [Prettier](https://prettier.io/), configured with [@valora/prettier-config](https://github.com/valora-inc/prettier-config)
- Scripts using [ShellJS](https://github.com/shelljs/shelljs)
  - Linted and statically checked with [TypeScript](https://www.typescriptlang.org/)
- CI/CD with [GitHub Actions](https://docs.github.com/en/actions)
  - Semantic PR title enforcement with [semantic-pull-request](https://github.com/amannn/action-semantic-pull-request)
- Automated dependency updates with [Renovate](https://renovatebot.com/), configured with [valora-inc/renovate-config](https://github.com/valora-inc/renovate-config)

## Type Checking

This project uses [TypeScript](https://www.typescriptlang.org/). It's recommended to get TypeScript set up for your editor to get a really great in-editor experience with type checking and auto-complete. To run type checking across the whole project, run `yarn typecheck`.

## Testing

For lower level tests of utilities and individual modules, we use [Jest](https://jestjs.io).

## Linting

This project uses [ESLint](https://eslint.org/) for linting. That is configured in [`.eslintrc.js`](.eslintrc.js).

## Formatting

We use [Prettier](https://prettier.io) for auto-formatting. It's recommended to install an editor plugin (like the [VSCode Prettier plugin](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)) to get auto-formatting on save. There's also a `yarn format` script you can run to format all files in the project.

## Dependency Checking

This project uses [depcheck](https://github.com/depcheck/depcheck) for checking dependency use. It's configured in [`.depcheckrc`](.depcheckrc).

## Scripts

We use TypeScript instead of shell scripts. This is it to avoid the many pitfalls of shell scripts.

To run external commands we recommend using [ShellJS](https://github.com/shelljs/shelljs).

## Renovate

[Renovate](https://renovatebot.com/) ensures our dependencies are kept up to date. It's configured with our shared config in [`renovate.json5`](renovate.json5).
