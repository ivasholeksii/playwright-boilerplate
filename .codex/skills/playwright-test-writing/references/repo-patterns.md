# Repo Patterns

## Repo Map

| Path | Purpose |
|------|---------|
| `tests/*.spec.ts` | UI e2e tests |
| `tests-api/*.test.ts` | API tests |
| `tests-examples/` | Playwright reference only — do not modify or add tests here |
| `lib/pages/*.page.ts` | Page objects (re-exported from `lib/pages/index.ts`) |
| `lib/components/*.component.ts` | UI sub-section components (re-exported from `lib/components/index.ts`) |
| `lib/index.ts` | Re-exports all pages and components |
| `lib/fixtures.ts` | Extended `test` fixture — **always** import `test`/`expect` from `@fixtures` in UI specs |
| `lib/types/api.types.ts` | Shared API request/response types (re-exported from `lib/types/index.ts`) |
| `lib/utils/*.ts` | Shared non-POM helper functions |
| `constants.ts` | UI user constants: `STANDARD_USER`, `LOCKED_OUT_USER`, `PROBLEM_USER`, `PERFORMANCE_GLITCH_USER`, `getUserPass()` |
| `constants-api-tests.ts` | API `BASE_URL` |
| `config/environments.ts` | `getEnvironmentConfig()` → `{ uiBaseURL, apiBaseURL }` per environment |
| `tests/auth.setup.ts` | Logs in and saves session to `playwright/.auth/standard-user.json` |
| `playwright.config.ts` | UI runner config (`testDir: './tests'`, `testIdAttribute: 'data-test'`) |
| `playwright.api.config.ts` | API runner config (`testDir: './tests-api'`) |

---

## Getting the Base URL

Never hard-code URLs in test files. Use the environment config:

```ts
// UI tests — uiBaseURL resolves to 'https://www.saucedemo.com' by default
import { getEnvironmentConfig } from '../config/environments';
const { uiBaseURL } = getEnvironmentConfig();

// API tests — BASE_URL is 'https://jsonplaceholder.typicode.com'
import { BASE_URL } from '../constants-api-tests';
```

---

## Selector and Locator Conventions

- `testIdAttribute` is set to `data-test` in `playwright.config.ts`
- `getByTestId('foo')` resolves the selector `[data-test="foo"]`
- Priority order: `getByTestId` → `getByRole` / `getByLabel` → `getByText`
- **Never** use CSS class selectors — they are fragile and violate this project's conventions

---

## Auth and Storage State

- `tests/auth.setup.ts` authenticates as `STANDARD_USER` and saves session to `playwright/.auth/standard-user.json`
- All UI browser projects in `playwright.config.ts` declare `dependencies: ['setup']` and load that storage state automatically
- For **unauthenticated** flows (login page, error pages): clear session at module scope — **before** `test.describe`:

```ts
// Must be at module scope, not inside describe or beforeEach
test.use({ storageState: { cookies: [], origins: [] } });
```

---

## UI Page Object Pattern

- Extend `BasePage` from `lib/pages/base.page.ts`
- `BasePage.page` is `public` — accessible in tests as `somePage.page`
- Declare all locators as `private readonly` class properties — never create them inside methods
- Provide small, composable `async` methods for user actions
- Override `navigate()` to call `super.navigate(this.url)` with an internal `private readonly url`
- Methods that return text or sub-elements **must throw `Error`** if the element is absent or empty — never return `null` or `undefined`

```ts
// CORRECT — locator is a stable class property
private readonly addButton = this.page.getByTestId('add-to-cart');
async addToCart(): Promise<void> { await this.addButton.click(); }

// WRONG — locator is created ad-hoc inside the method
async addToCart(): Promise<void> { await this.page.getByTestId('add-to-cart').click(); }
```

---

## Component Pattern

- Accept a `Locator` (not `Page`) in the constructor — all internal queries are scoped to that container
- Components are instantiated only by page object methods that return sub-sections (e.g. `InventoryPage.getProductByName()`)
- Never instantiate components directly in test files

```ts
// Page object method returns a component
async getProductByName(name: string): Promise<InventoryProductComponent> {
    const product = this.product.filter({ hasText: name });
    if (!product) throw new Error(`Product "${name}" not found`);
    return new InventoryProductComponent(product);
}
```

---

## Fixture Extension Pattern

When adding a new page object, register it as a fixture in `lib/fixtures.ts` so tests can use it by name:

```ts
import { test as base } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { InventoryPage } from './pages/inventory.page';
import { CheckoutPage } from './pages/checkout.page'; // 1. Import the new page

type PageFixtures = {
    loginPage: LoginPage;
    inventoryPage: InventoryPage;
    checkoutPage: CheckoutPage; // 2. Add to the type
};

export const test = base.extend<PageFixtures>({
    loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
    inventoryPage: async ({ page }, use) => { await use(new InventoryPage(page)); },
    checkoutPage: async ({ page }, use) => { await use(new CheckoutPage(page)); }, // 3. Register factory
});

export { expect } from '@playwright/test';
```

The fixture is now available in any UI spec: `async ({ checkoutPage }) => { ... }`.

---

## API Test Pattern

- Import `test`/`expect` from `@playwright/test` — not `@fixtures`
- Import `BASE_URL` from `../constants-api-tests`
- Use the `request` fixture directly — no page objects or custom fixtures
- Define shared response/request shapes in `lib/types/api.types.ts` and import from `../lib/types`

---

## Data-Driven Tests

Use `Array.forEach` inside a `test.describe` block to generate parameterised tests:

```ts
const invalidInputs = [
    '',
    ' ',
    '<script>alert("XSS")</script>',
    'SELECT * FROM users WHERE ""=""',
];

test.describe('invalid login inputs', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.navigate(uiBaseURL);
    });

    invalidInputs.forEach((input) => {
        test(`rejects input: "${input}"`, async ({ loginPage }) => {
            await loginPage.enterUsername(input);
            await loginPage.enterPassword(input);
            await loginPage.clickLoginButton();
            expect(await loginPage.isErrorMessageDisplayed()).toBe(true);
        });
    });
});
```

---

## Error Handling Contract

- Page object and component methods that return text or components **must throw `Error`** when the element is absent or has no text
- Never return `null` or `undefined` from these methods
- Pattern: `if (!text) throw new Error('Descriptive message about what was missing');`

---

## Accessing Raw Page in Tests

- `BasePage.page` is `public` — accessible from tests via `somePage.page`
- Prefer POM methods first; use `somePage.page` only for assertions the POM doesn't cover

```ts
// POM method doesn't expose a URL check — fall back to raw page
await expect(loginPage.page).toHaveURL(/inventory\.html/);
await expect(loginPage.page).toHaveTitle('Swag Labs');
```

---

## Concurrency and Stability

- `fullyParallel: true` — each test runs in its own isolated browser context
- Never share mutable state between tests (no module-level arrays that tests mutate, etc.)
- `forbidOnly: !!process.env.CI` — `test.only` will fail CI builds; never commit it
- `retries: 2` on CI, `0` locally — tests must be deterministic, not retry-dependent
