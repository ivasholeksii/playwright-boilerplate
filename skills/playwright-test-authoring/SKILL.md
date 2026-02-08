---
name: playwright-test-authoring
description: Create or update Playwright UI and API tests in this repo. Use when asked to add test coverage, new specs, page objects, API request tests, or to follow local conventions for test directories, auth setup, selectors, and constants.
---

# Playwright Test Authoring

## Quick Start

1. Identify whether the request is UI, API, or both.
2. Read `references/repo-patterns.md` for file locations and conventions.
3. Use `references/templates.md` as a starting point for new specs, page objects, or components.

## Workflow

1. Locate or create the target spec in `tests/` (UI) or `tests-api/` (API).
2. Reuse existing page objects/components; add new ones only when needed.
3. Implement tests with `test.describe`, `test.beforeEach`, and stable locators.
4. Add assertions that reflect user-visible behavior and API contracts.
5. Keep tests deterministic and parallel-safe.

## Key Conventions

- Keep UI specs in `tests/*.spec.ts` and API specs in `tests-api/*.test.ts`.
- Prefer page objects in `lib/pages` and components in `lib/components`.
- Use `getByTestId` with `data-test` attributes (see config).
- Use `constants.ts` for UI base URL and credentials, and `constants-api-tests.ts` for API base URL.
- Use `tests/auth.setup.ts` and storage state for authenticated UI flows.
- Use `test.use({ storageState: { cookies: [], origins: [] } })` for unauthenticated UI tests.
- Avoid leaving `test.only` in committed code.

## When Adding Pages or Components

- Extend `BasePage` and expose small, composable methods.
- Keep locators private and stable.
- Add reusable UI pieces as components in `lib/components`.

## Checks Before Finishing

- Ensure test titles describe user-visible behavior.
- Prefer `expect(locator).to...` over raw `page` checks.
- Keep tests independent for `fullyParallel` execution.
- Add or update API types in `tests-api/types/types.ts` when adding payloads.

## References

- `references/repo-patterns.md` for repo map, auth setup, and examples.
- `references/templates.md` for UI/API/page object skeletons.
