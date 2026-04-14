---
name: playwright-test-writing
description: Create or update Playwright UI end-to-end tests. Use when asked to add UI test coverage, new spec files, page objects, components, or fixtures. Covers selectors, auth state, assertions, and all UI-layer conventions. For API tests use the `playwright-api-test-writing` skill instead.
---

# Playwright UI Test Writing

## Quick Start

1. Confirm the request is for UI tests (`tests/` directory). For API tests, use the `playwright-api-test-writing` skill instead.
2. Read `references/repo-patterns.md` for the full repo map and all conventions.
3. Use `references/templates.md` as copy-paste starting points — adapt names, never invent new patterns.

---

## Step-by-Step Workflow

### Writing a UI Test

1. Create or open `tests/<feature>.spec.ts`.
2. Import `test` and `expect` from `@fixtures` — **never** from `@playwright/test`.
3. For **unauthenticated** flows (login page, error pages): add `test.use({ storageState: { cookies: [], origins: [] } })` at **module scope**, before `test.describe`.
4. For unauthenticated tests: import `getEnvironmentConfig` and destructure `uiBaseURL` at module scope — pass it to `navigate(uiBaseURL)`. Authenticated page objects call `navigate()` with no argument.
5. Reuse existing page objects (`lib/pages/`) and components (`lib/components/`). Create new ones only when there is no suitable existing class.
6. Write assertions against **locators** — use `await expect(locator).toHaveText(...)` not `expect(await locator.textContent()).toBe(...)`.
7. Keep tests fully independent — no shared mutable state between tests, no `test.only`.

### Adding a New Page Object

1. Create `lib/pages/<name>.page.ts` extending `BasePage`.
2. Declare all locators as `private readonly` class properties at the top of the class — **never** create locators inside method bodies.
3. Provide small, composable `async` methods for user actions.
4. Methods that return text or sub-elements must `throw new Error('...')` if the element is absent — never return `null` or `undefined`.
5. If the page has a fixed URL, store it as `private readonly url = '/path.html'` and provide a zero-argument `navigate(): Promise<void>` that calls `super.navigate(this.url)`.
6. Export from `lib/pages/index.ts`.
7. Register as a fixture in `lib/fixtures.ts` — add to `PageFixtures` type and `base.extend` call.

### Adding a New Component

1. Create `lib/components/<name>.component.ts`.
2. Accept a `Locator` (not `Page`) in the constructor — scope all internal queries to that container.
3. Export from `lib/components/index.ts`.
4. Instantiate **only** inside a page object method — never directly in a test file.

---

## Key Conventions — Never Deviate

| Rule | Correct | Wrong |
|------|---------|-------|
| Selectors | `getByTestId('foo')` | `locator('.class-name')` |
| Imports in UI specs | `from '@fixtures'` | `from '@playwright/test'` |
| Locator assertions | `await expect(locator).toBeVisible()` | `expect(await locator.isVisible()).toBe(true)` |
| Page URL assertion | `await expect(page).toHaveURL(/path/)` | `expect(await page.url()).toContain('path')` |
| Page title assertion | `await expect(page).toHaveTitle('Swag Labs')` | `expect(await page.title()).toBe('Swag Labs')` |
| Auto-wait | `await expect(locator).toHaveText(...)` | `await page.waitForTimeout(1000)` |
| Authenticated navigate | `inventoryPage.navigate()` — no URL arg | Inline `page.goto('https://...')` |
| Unauthenticated navigate | `loginPage.navigate(uiBaseURL)` via `getEnvironmentConfig()` | Inline URL string |
| Locator definition | `private readonly foo = this.page.getByTestId('foo')` | Locator created inside method body |
| Missing element | `throw new Error('Descriptive message')` | `return null` or `return undefined` |
| Auth override scope | `test.use({ storageState: ... })` at **module scope** | Inside `describe` or `beforeEach` |

---

## Assertion Guidance

Always prefer **locator-based assertions** — they auto-retry until the condition is met or timeout expires:

```ts
// CORRECT — auto-retries, descriptive failure message
await expect(locator).toBeVisible();
await expect(locator).toHaveText('Expected text');
await expect(locator).toHaveCount(3);
await expect(page).toHaveURL(/inventory\.html/);
await expect(page).toHaveTitle('Swag Labs');

// ACCEPTABLE — when a page object method returns a resolved boolean
// Use only after actions that produce immediate results
const isDisplayed = await loginPage.isErrorMessageDisplayed();
expect(isDisplayed).toBe(true);

// WRONG — misleading, no auto-retry, fragile
await expect(await page.title()).toBe('Swag Labs');        // await expect() on a non-Promise
expect(await locator.textContent()).toBe('Expected text'); // no retry
```

Use `isVisible()` / `textContent()` only when the **value is needed for conditional logic** — never as the primary assertion mechanism.

---

## Anti-Patterns

| Anti-pattern | Why | Fix |
|---|---|---|
| `locator('.some-class')` | Fragile CSS coupling | `getByTestId('...')` or `getByRole(...)` |
| `expect(await locator.textContent()).toBe(...)` | No auto-retry, timing-sensitive | `expect(locator).toHaveText(...)` |
| `await page.waitForTimeout(1000)` | Arbitrary sleep, slow & brittle | Express intent via auto-waiting assertions |
| `import { test } from '@playwright/test'` in UI spec | Bypasses page object fixture injection | `import { test } from '@fixtures'` |
| Inline URL string in test | Breaks when switching environments | `getEnvironmentConfig().uiBaseURL` |
| `test.only` | Blocked by `forbidOnly: true` on CI | Remove before committing |
| Page object method returns `null`/`undefined` | Silent failures hide missing elements | `throw new Error('...')` |
| UI spec in `tests-api/` | Wrong runner, wrong config | Put in `tests/` |
| Locator created inside a method body | Re-queries on every call, not reusable | Declare as `private readonly` class property |
| `await expect(await something)` | `expect()` is synchronous — the outer `await` is a no-op and adds confusion | `await expect(locator)` or `expect(await method())` |

---

## Extending the Repo

| Scenario | What to create | Where |
|---|---|---|
| New page/route to test | Page object | `lib/pages/name.page.ts` |
| Repeated UI sub-section shared across pages | Component | `lib/components/name.component.ts` |
| New page object accessible as a fixture | Fixture entry | `lib/fixtures.ts` |
| New user credential or role | Constant | `constants.ts` |
| Shared helper (not a page object) | Utility | `lib/utils/name.ts` |

After adding a page or component, export it from the corresponding `index.ts` barrel file.

---

## Config Quick Reference

| Setting | Value | Effect |
|---|---|---|
| `testDir` | `./tests` | Only `tests/` files run with UI config |
| `testIdAttribute` | `data-test` | `getByTestId('foo')` → `[data-test="foo"]` |
| `fullyParallel` | `true` | Each test gets its own isolated browser context |
| `forbidOnly` | `true` on CI | `test.only` fails the build |
| `retries` | `2` on CI, `0` locally | Tests must be deterministic |
| `storageState` | `playwright/.auth/standard-user.json` | All browser projects load session automatically |

---

## Checklist Before Finishing

- [ ] Test titles describe user-visible behaviour, not implementation details
- [ ] All selectors use `getByTestId()` or semantic role/label queries — no CSS classes
- [ ] Assertions are locator-based — no `await expect(await ...)` patterns
- [ ] No `page.waitForTimeout()` calls
- [ ] No `test.only` committed
- [ ] `test` and `expect` imported from `@fixtures`, not `@playwright/test`
- [ ] Unauthenticated tests have `test.use({ storageState: { cookies: [], origins: [] } })` at module scope
- [ ] New page objects: extend `BasePage`, `private readonly` locators, exported from `lib/pages/index.ts`, registered in `lib/fixtures.ts`
- [ ] New components: accept `Locator` constructor, exported from `lib/components/index.ts`
- [ ] No inline constant strings — credentials and user names in `constants.ts`
- [ ] Tests are independent and safe to run under `fullyParallel: true`

---

## References

- `references/repo-patterns.md` — repo map, auth, selectors, fixture extension, data-driven patterns
- `references/templates.md` — copy-paste skeletons for every UI file type
