# Playwright Typescript Boilerplate Project

Created by: **Oleksii Ivashchenko** [Linkedin](https://www.linkedin.com/in/oivashchenko/)

This project is a boilerplate for Playwright tests written in Typescript. It includes sample tests, configured to run tests in three different browsers, and has built-in linting and formatting tools (eslint and prettier) with Git hooks (husky). Additionally, the project is set up for Github Actions to run tests in a container.

## Setup

To use this project, download, clone or fork the repository.

Then, install the dependencies:

```bash
yarn
```

TEST

### Setup in Github

This project requires github secret to be configure.

Set up USER_PASS variable (see default value in the `.env.example` file) in the `/settings/secrets/actions` of your repository.

## Usage

To run the sample tests in all three browsers (Chromium, Firefox, and Webkit), use the following command:

```bash
yarn test
```

## AI-Assisted Test Authoring (Skill)

This repo includes a skill to help modern AI coding tools generate Playwright tests that follow local conventions.

**Skill location:** `skills/playwright-test-authoring/`

What the skill encodes:

- Where UI and API specs live
- Page object and component patterns
- Auth setup and storage state usage
- Selector and test ID conventions
- Test templates and best practices

### How to use it with AI coding tools

1. Open the repo in your AI tool (Codex Desktop, ChatGPT with repo access, Cursor, Windsurf, VS Code Copilot Chat, etc.).
2. Point the tool to `skills/playwright-test-authoring/SKILL.md` and the references in `skills/playwright-test-authoring/references/`.
3. Ask it to create tests using the existing patterns.

### Example prompts

- `Use the Playwright test authoring skill in this repo and add a login test for locked-out users.`
- `Create a new API spec under tests-api/ for the /posts endpoint, following repo patterns.`
- `Add page object methods in lib/pages to support a new inventory test.`

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

## API tests

For API tests free API used: [https://jsonplaceholder.typicode.com/](https://jsonplaceholder.typicode.com/)

### Run api test

To run API tests use command: `yarn test:api`

### Configuration

Configuration for API tests is located in the `playwright.api.config.ts`

## License

This project is licensed under the MIT license. See the `LICENSE` file for details.
