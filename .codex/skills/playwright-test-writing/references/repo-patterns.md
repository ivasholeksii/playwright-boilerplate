# UI Repo Patterns

## Repo Map

| Path | Purpose |
|------|---------|
| `tests/*.spec.ts` | UI end-to-end test files |
| `tests-examples/` | Playwright reference examples — do not modify |
| `lib/pages/*.page.ts` | Page objects (re-exported from `lib/pages/index.ts`) |
| `lib/components/*.component.ts` | UI sub-section components (re-exported from `lib/components/index.ts`) |
| `lib/index.ts` | Re-exports all pages and components |
| `lib/fixtures.ts` | Extended `test` — **always** import `test`/`expect` from `@fixtures` in UI specs |
| `lib/utils/*.ts` | Shared non-POM helper functions |
| `constants.ts` | User constants: `STANDARD_USER`, `LOCKED_OUT_USER`, `PROBLEM_USER`, `PERFORMANCE_GLITCH_USER`, `getUserPass()` |
| `config/environments.ts` | `getEnvironmentConfig()` → `{ uiBaseURL, apiBaseURL }` per environment |
| `tests/auth.setup.ts` | Authenticates as `STANDARD_USER` and saves session to `playwright/.auth/standard-user.json` |
| `playwright.config.ts` | UI runner config (`testDir: './tests'`, `testIdAttribute: 'data-test'`, `baseURL: uiBaseURL`) |

---

## Base URL

Never hard-code URLs in test files.

**Unauthenticated tests** must call `navigate(uiBaseURL)` — import `getEnvironmentConfig`:

```ts
import { getEnvironmentConfig } from '../config/environments';

const { uiBaseURL } = getEnvironmentConfig();
// uiBaseURL = 'https://www.saucedemo.com' (staging default)
```

**Authenticated page objects** store their own relative path and resolve it against `baseURL` from the config — the test passes no URL:

```ts
// Inside InventoryPage:
private readonly url = '/inventory.html';
async navigate(): Promise<void> {
    await super.navigate(this.url); // page.goto('/inventory.html') resolved against baseURL
}

// In a test:
await inventoryPage.navigate(); // no URL argument
```

---

## Selector Priority

1. `getByTestId('data-test-value')` — primary selector, maps to `[data-test="..."]`
2. `getByRole('button', { name: 'Submit' })` — semantic ARIA selector
3. `getByLabel('Email address')` — form label selector
4. `getByText('exact text')` — last resort, only for unique static text

**Never** use CSS class selectors (`locator('.class-name')`) — they couple tests to implementation details and break on style refactors.

---

## Auth and Storage State

- `tests/auth.setup.ts` authenticates as `STANDARD_USER` and saves session to `playwright/.auth/standard-user.json`
- All browser projects (`chromium`, `firefox`, `webkit`) declare `dependencies: ['setup']` and load that storage state automatically
- All tests in `tests/` are **authenticated by default**
- For **unauthenticated** flows, clear the session at **module scope** — before `test.describe`, never inside it:

```ts
// CORRECT — module scope
test.use({ storageState: { cookies: [], origins: [] } });

const { uiBaseURL } = getEnvironmentConfig(); // needed to pass to navigate()

test.describe('login', () => { ... });

// WRONG — inside describe
test.describe('login', () => {
    test.use({ storageState: { cookies: [], origins: [] } }); // too late
});
```

---

## Page Object Pattern

- Extend `BasePage` from `lib/pages/base.page.ts`
- `BasePage.page` is `public` — accessible in tests as `somePage.page` when no page object method covers the needed assertion
- Declare all locators as `private readonly` class properties — never create them inside method bodies
- Provide small, composable `async` methods for user actions
- Methods that return text or sub-elements **must throw `Error`** if the element is absent — never return `null` or `undefined`

```ts
// CORRECT — stable class property, reusable across method calls
private readonly addButton = this.page.getByTestId('add-to-cart');
async addToCart(): Promise<void> { await this.addButton.click(); }

// WRONG — locator constructed fresh inside every call
async addToCart(): Promise<void> { await this.page.getByTestId('add-to-cart').click(); }
```

---

## Component Pattern

- Accept a `Locator` (not `Page`) in the constructor — all internal queries are scoped to that container
- Components are instantiated **only** inside page object methods that return sub-sections
- Never instantiate components directly in test files

```ts
// Page object method returns a component scoped to a single product card
async getProductByName(name: string): Promise<InventoryProductComponent> {
    const product = this.product.filter({ hasText: name });
    if (!product) throw new Error(`Product "${name}" not found`);
    return new InventoryProductComponent(product);
}
```

---

## Fixture Extension Pattern

When adding a new page object, register it in `lib/fixtures.ts`:

```ts
import { test as base } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { InventoryPage } from './pages/inventory.page';
import { CheckoutPage } from './pages/checkout.page'; // 1. Import

type PageFixtures = {
    loginPage: LoginPage;
    inventoryPage: InventoryPage;
    checkoutPage: CheckoutPage; // 2. Add to type
};

export const test = base.extend<PageFixtures>({
    loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
    inventoryPage: async ({ page }, use) => { await use(new InventoryPage(page)); },
    checkoutPage: async ({ page }, use) => { await use(new CheckoutPage(page)); }, // 3. Register
});

export { expect } from '@playwright/test';
```

The fixture is then available in any UI spec: `async ({ checkoutPage }) => { ... }`.

---

## Data-Driven Tests

Use `Array.forEach` inside a `test.describe` block to generate parameterised tests:

```ts
const invalidInputs = [
    '',
    ' ',
    '<script>alert("XSS")</script>',
    '"><script>alert("XSS")</script>',
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
            const isDisplayed = await loginPage.isErrorMessageDisplayed();
            expect(isDisplayed).toBe(true);
        });
    });
});
```

---

## Accessing Raw Page in Tests

`BasePage.page` is `public` — use it for assertions that page object methods don't cover:

```ts
// Page object doesn't expose URL/title checks — fall back to raw page
await expect(inventoryPage.page).toHaveURL(/inventory\.html/);
await expect(inventoryPage.page).toHaveTitle('Swag Labs');
```

---

## Concurrency and Stability

- `fullyParallel: true` — each test runs in its own isolated browser context
- Never share mutable state between tests (no module-level arrays mutated across tests)
- `forbidOnly: !!process.env.CI` — `test.only` fails CI builds; never commit it
- `retries: 2` on CI, `0` locally — tests must be deterministic, not retry-dependent
