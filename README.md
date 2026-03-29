# Playwright Typescript Boilerplate Project

Created by: **Oleksii Ivashchenko** [Linkedin](https://www.linkedin.com/in/oivashchenko/)

This project is a boilerplate for Playwright tests written in Typescript. It includes sample tests, configured to run tests in three different browsers, and has built-in linting and formatting tools (eslint and prettier) with Git hooks (husky). Additionally, the project is set up for Github Actions to run tests in a container.

## Project Structure

Two independent test suites with separate Playwright configs:

```
tests/*.spec.ts         → playwright.config.ts       (chromium + firefox + webkit)
tests-api/*.test.ts     → playwright.api.config.ts   (request fixture, no browser)

lib/pages/              → page objects (extend BasePage)
lib/components/         → reusable Locator wrappers
lib/fixtures.ts         → test extended with loginPage / inventoryPage fixtures
lib/types/              → shared TypeScript types
constants.ts            → UI base URL + test user credentials
constants-api-tests.ts  → API base URL
```

## Setup

To use this project, download, clone or fork the repository.

Then, install the dependencies:

```bash
yarn
```

### Setup in Github

This project requires github secret to be configure.

Set up USER_PASS variable (see default value in the `.env.example` file) in the `/settings/secrets/actions` of your repository.

## Commands

```bash
yarn test        # UI tests — chromium, firefox, webkit
yarn test:api    # API tests
yarn test:ui     # open Playwright UI mode
yarn test:ci     # CI run with sharding
yarn lint        # lint check
yarn lint-fix    # auto-fix lint issues
```

## Key Conventions

- **Selectors**: always `getByTestId()` — `testIdAttribute` is set to `data-test` in `playwright.config.ts`
- **Test imports**: `test` and `expect` from `@fixtures`, not from `@playwright/test`
- **Page objects**: extend `BasePage`; locators `private readonly`; methods `async`
- **Anti-patterns**: no `page.waitForTimeout()`, no CSS class selectors, no `test.only` in commits

For full detail see `CLAUDE.md` (Claude Code users) or `.codex/skills/playwright-test-writing/SKILL.md`.

## AI-Assisted Test Authoring (Skill)

This repo includes guidance for a skill to help modern AI coding tools generate Playwright tests that follow local conventions.

**For Claude Code / Claude.ai users:** `CLAUDE.md` at the repo root is loaded automatically and provides always-on context — commands, conventions, file placement rules, and anti-patterns.

**Skill location:** `.codex/skills/playwright-test-writing/SKILL.md`

What the skill encodes:

- Where UI and API specs live
- Page object and component patterns
- Auth setup and storage state usage
- Selector and test ID conventions
- Test templates and best practices

### How to use it with AI coding tools

1. Open the repo in your AI tool (Codex Desktop, ChatGPT with repo access, Cursor, Windsurf, VS Code Copilot Chat, etc.).
2. Point the tool to `.codex/skills/playwright-test-writing/SKILL.md` and its references directory.
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

This project is set up for Github Actions to run tests in a container. The workflow is defined in `.github/workflows/playwright.yml`.

It uses **path-based filtering** — only the affected suite runs when you push (e2e changes trigger the UI job, API changes trigger the API job). E2E tests run with **sharding** across multiple workers for faster CI.

## API tests

For API tests free API used: [https://jsonplaceholder.typicode.com/](https://jsonplaceholder.typicode.com/)

### Run api test

To run API tests use command: `yarn test:api`

### Configuration

Configuration for API tests is located in the `playwright.api.config.ts`

## License

This project is licensed under the MIT license. See the `LICENSE` file for details.
