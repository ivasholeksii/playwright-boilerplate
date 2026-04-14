---
name: playwright-test-writing
description: Create or update Playwright UI and API tests in this repo. Use when asked to add test coverage, new specs, page objects, API request tests, or to follow local conventions for test directories, auth setup, selectors, and constants.
---

# Playwright Test Writing

## Quick Start

1. Identify whether the request is UI (`tests/`), API (`tests-api/`), or both.
2. Read `references/repo-patterns.md` for the full repo map and real patterns.
3. Use `references/templates.md` as copy-paste starting points — adapt, don't invent.

---

## Step-by-Step Workflow

### Writing a UI Test

1. Create or open `tests/<feature>.spec.ts`.
2. Import `test` and `expect` from `@fixtures` — **never** from `@playwright/test`.
3. If the test targets an unauthenticated flow, add `test.use({ storageState: { cookies: [], origins: [] } })` at module scope before `test.describe`.
4. Get the base URL from `getEnvironmentConfig().uiBaseURL` — not from `constants.ts`.
5. Reuse existing page objects (`lib/pages/`) and components (`lib/components/`); create new ones only when needed.
6. Write assertions against locators (`expect(locator).toBeVisible()`) — never against resolved values (`expect(await locator.isVisible())`).
7. Ensure tests are fully independent — no shared mutable state, no `test.only`.

### Writing an API Test

1. Create or open `tests-api/<resource>.test.ts`.
2. Import `test` and `expect` from `@playwright/test` (not `@fixtures`).
3. Import `BASE_URL` from `../constants-api-tests`.
4. Define request/response types in `lib/types/api.types.ts`; import from `../lib/types`.
5. Use the `request` fixture directly — no page objects or fixtures needed.

### Adding a New Page Object

1. Create `lib/pages/<name>.page.ts` extending `BasePage`.
2. Export it from `lib/pages/index.ts`.
3. Add a fixture in `lib/fixtures.ts`: add the type to `PageFixtures` and register the factory in `base.extend`.
4. The new fixture is then available as a named parameter in any UI spec.

### Adding a New Component

1. Create `lib/components/<name>.component.ts` accepting a `Locator` (not `Page`) in its constructor.
2. Export it from `lib/components/index.ts`.
3. Instantiate it inside a page object method that returns the sub-section — never directly in tests.

---

## Key Conventions — Never Deviate

| Rule | Correct | Wrong |
|------|---------|-------|
| Selectors | `getByTestId('foo')` | `locator('.class-name')` |
| UI test imports | `from '@fixtures'` | `from '@playwright/test'` or `from '../lib/fixtures'` |
| Locator assertions | `await expect(locator).toBeVisible()` | `expect(await locator.isVisible()).toBe(true)` |
| Page-level assertions | `await expect(page).toHaveTitle('...')` | `expect(await page.title()).toBe('...')` |
| Auto-wait | `await expect(locator).toHaveText(...)` | `await page.waitForTimeout(1000)` |
| Base URL | `getEnvironmentConfig().uiBaseURL` | Inline `'https://...'` strings |
| Locator scope | `private readonly` class property | Ad-hoc locator inside a method body |
| No-result guard | `throw new Error('...')` | `return null` or `return undefined` |
| Auth state | `test.use({ storageState: ... })` at module scope | Inside `describe` or `beforeEach` |

---

## Anti-Patterns

- **CSS selectors**: `locator('.some-class')` — always use `getByTestId()` or semantic ARIA queries
- **Resolved-value assertions**: `expect(await locator.textContent()).toBe(...)` — use `expect(locator).toHaveText(...)` for auto-retry
- **Hard waits**: `page.waitForTimeout()` — Playwright auto-waits; express intent via assertions
- **Wrong import in UI specs**: `import { test } from '@playwright/test'` — must be `@fixtures`
- **Wrong import in API specs**: `import { test } from '@fixtures'` — must be `@playwright/test`
- **Inline constant strings**: base URLs, credentials — add them to `constants.ts` or `constants-api-tests.ts`
- **`test.only` in committed code**: blocked by `forbidOnly` in CI
- **Returning `null`/`undefined`**: page object methods must throw `Error` with a descriptive message if an element is missing
- **Mixing test types**: UI specs in `tests-api/`, API specs in `tests/`

---

## Assertion Guidance

Prefer locator-based assertions — they auto-retry until the condition is met or the timeout expires:

```ts
// PREFERRED — auto-retries, clear failure messages
await expect(locator).toBeVisible();
await expect(locator).toHaveText('Expected text');
await expect(locator).toHaveCount(3);
await expect(page).toHaveURL(/inventory\.html/);
await expect(page).toHaveTitle('Swag Labs');

// AVOID — evaluated once, no retry, fragile
expect(await locator.isVisible()).toBe(true);
expect(await page.title()).toBe('Swag Labs');
expect(await locator.textContent()).toBe('Expected text');
```

Use `isVisible()` / `textContent()` only when you need the value for logic (e.g. conditional branching), not for assertions.

---

## Extending the Repo — Decision Tree

| Scenario | What to create | Where |
|----------|---------------|-------|
| New page/route to test | Page object | `lib/pages/name.page.ts` |
| Repeated UI sub-section shared across pages | Component | `lib/components/name.component.ts` |
| New page object accessible as a fixture | Fixture entry | `lib/fixtures.ts` |
| New UI credential or user constant | Constant | `constants.ts` |
| New API base URL or endpoint prefix | Constant | `constants-api-tests.ts` |
| New API response/request type | Type | `lib/types/api.types.ts` |
| Shared non-POM helper function | Utility | `lib/utils/name.ts` |

After adding a page or component, export from the corresponding barrel `index.ts`.

---

## Config Mapping

| Config file | Test directory | Auth | `baseURL` source |
|---|---|---|---|
| `playwright.config.ts` | `tests/` | `setup` project → `playwright/.auth/standard-user.json` | `getEnvironmentConfig().uiBaseURL` |
| `playwright.api.config.ts` | `tests-api/` | none | `getEnvironmentConfig().apiBaseURL` |

- `testIdAttribute: 'data-test'` in UI config → `getByTestId('foo')` resolves `[data-test="foo"]`
- `fullyParallel: true` → each test gets its own browser context; no shared state across tests
- `retries: 2` on CI, `0` locally; `forbidOnly: true` on CI

---

## Checks Before Finishing

- [ ] Test titles describe user-visible behaviour, not implementation details
- [ ] All selectors use `getByTestId()` or semantic role/label queries — no CSS classes
- [ ] Assertions are locator-based (auto-retry) — no `await expect(await ...)`
- [ ] No `page.waitForTimeout()` calls
- [ ] No `test.only` left in code
- [ ] New page objects extend `BasePage`, use `private readonly` locators, exported from `lib/pages/index.ts`
- [ ] New page objects registered as fixtures in `lib/fixtures.ts`
- [ ] New components accept `Locator`, not `Page`, exported from `lib/components/index.ts`
- [ ] New API types added to `lib/types/api.types.ts`
- [ ] No inline constant strings — use `constants.ts` or `constants-api-tests.ts`
- [ ] Tests are independent and safe to run under `fullyParallel: true`

---

## References

- `references/repo-patterns.md` — repo map, auth, locator conventions, fixture extension, data-driven patterns
- `references/templates.md` — copy-paste skeletons for every file type
