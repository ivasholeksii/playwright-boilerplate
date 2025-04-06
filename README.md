# Playwright Typescript Boilerplate Project

Created by: **Oleksii Ivashchenko** [Linkedin](https://www.linkedin.com/in/oivashchenko/)

This project is a boilerplate for Playwright tests written in Typescript. It includes sample tests, configured to run tests in three different browsers, and has built-in linting and formatting tools (eslint and prettier) with Git hooks (husky). Additionally, the project is set up for Github Actions to run tests in a container.

## Setup

To use this project, download, clone or fork the repository.

Then, install the dependencies:

```bash
yarn
```

### Setup in Github

This project requires github secret to be configure.

Set up USER_PASS variable (see default value in the `.env.example` file) in the `/settings/secrets/actions` of your repository.

## Usage

To run the sample tests in all three browsers (Chromium, Firefox, and Webkit), use the following command:

```bash
yarn test
```

## Linting and Formatting

This project uses eslint and prettier for linting and formatting. To run linting and formatting checks, use the following command:

```bash
yarn lint
```

To automatically fix formatting errors, use:

```bash
yarn lint-fix
```

## Git Hooks

This project includes Git hooks using husky. When you commit changes, husky will run the linting and formatting checks automatically.

## Github Actions

This project is set up for Github Actions to run tests in a container. The Github Actions workflow is defined in the `.github/workflows/playwright.yml` file. The workflow will run the tests in browsers defined in `playwright.config.ts`.

## License

This project is licensed under the MIT license. See the `LICENSE` file for details.
