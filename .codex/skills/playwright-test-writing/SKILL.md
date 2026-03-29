---
name: playwright-test-writing
description: Create or update Playwright UI and API tests in this repo. Use when asked to add test coverage, new specs, page objects, API request tests, or to follow local conventions for test directories, auth setup, selectors, and constants.
---

# Playwright Test Writing

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
- After adding, export from the corresponding barrel file (`lib/pages/index.ts` or `lib/components/index.ts`).

## Anti-Patterns (never do these)

- Do not use CSS class selectors like `locator('.some-class')` — use `getByTestId()` only.
- Do not use `page.waitForTimeout()` — use auto-waiting Playwright assertions.
- Do not import `test`/`expect` from `@playwright/test` in UI spec files — import from `lib/fixtures.ts`.
- Do not leave `test.only` in committed code.
- Do not put constants inline in test files — add them to `constants.ts` or `constants-api-tests.ts`.
- Do not return `null` or `undefined` from page object methods — throw `Error` with a descriptive message.

## Extending the Repo — Decision Tree

| Scenario                                  | What to create | Where                              |
| ----------------------------------------- | -------------- | ---------------------------------- |
| New page/route to test                    | Page object    | `lib/pages/name.page.ts`           |
| Repeated sub-section shared across routes | Component      | `lib/components/name.component.ts` |
| New UI constant (URL, credential)         | Add to         | `constants.ts`                     |
| New API constant (base URL)               | Add to         | `constants-api-tests.ts`           |
| New API response type                     | Add to         | `lib/types/api.types.ts`           |
| Shared non-POM helper function            | Add to         | `lib/utils/name.ts`                |

After adding a page or component, export it from the corresponding `index.ts` barrel file.

## Config Mapping

- `playwright.config.ts` → runs `tests/` → includes the `setup` auth project → uses `playwright/.auth/standard-user.json`
- `playwright.api.config.ts` → runs `tests-api/` → no auth project → uses the `request` fixture directly
- `testIdAttribute: 'data-test'` is set in `playwright.config.ts` — this is why `getByTestId('foo')` maps to `[data-test=foo]`
- Never add UI specs to `tests-api/` or vice versa

## Checks Before Finishing

- Ensure test titles describe user-visible behavior.
- Prefer `expect(locator).to...` over raw `page` checks.
- Keep tests independent for `fullyParallel` execution.
- Add or update API types in `lib/types/api.types.ts` when adding payloads.
- New pages/components are exported from the corresponding barrel `index.ts`.

## References

- `references/repo-patterns.md` for repo map, auth setup, and examples.
- `references/templates.md` for UI/API/page object skeletons.
