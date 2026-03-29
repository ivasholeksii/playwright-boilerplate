# Repo Patterns

## Repo Map

- UI specs: `tests/*.spec.ts`
- API specs: `tests-api/*.test.ts`
- Example specs: `tests-examples/` (reference only)
- Page objects: `lib/pages/*.page.ts` (exported from `lib/pages/index.ts`)
- Components: `lib/components/*.component.ts` (exported from `lib/components/index.ts`)
- All pages + components: `lib/index.ts`
- Fixtures: `lib/fixtures.ts` (import `test` and `expect` from here for UI specs)
- Shared types: `lib/types/api.types.ts` (exported from `lib/types/index.ts`)
- Shared helpers: `lib/utils/*.ts`
- UI constants: `constants.ts`
- API constants: `constants-api-tests.ts`
- Auth setup: `tests/auth.setup.ts`
- UI config: `playwright.config.ts`
- API config: `playwright.api.config.ts`

## Selector and Locator Conventions

- `testIdAttribute` is set to `data-test` in `playwright.config.ts`.
- Prefer `page.getByTestId('...')`, `locator.getByTestId('...')`, and role/label queries.
- Never use CSS class selectors — they are not stable and not the convention.

## Auth and Storage State

- Auth storage is created in `tests/auth.setup.ts` and saved to `playwright/.auth/standard-user.json`.
- UI projects depend on `setup` in `playwright.config.ts` and reuse that storage state.
- For login or unauthenticated flows, clear storage with `test.use({ storageState: { cookies: [], origins: [] } })` as in `tests/login.spec.ts`.

## UI Page Object Pattern

- Extend `BasePage` and use `navigate()` to go to a path.
- Keep locators `private readonly` and provide small action methods.
- Example files: `lib/pages/login.page.ts`, `lib/pages/inventory.page.ts`.

## Component Pattern

- Components wrap a `Locator` (not a `Page`).
- Instantiated from page object methods that return sub-sections of a page (e.g. `InventoryPage.getProductByName()`).
- Example file: `lib/components/inventory-product.component.ts`.

## API Test Pattern

- Use the `request` fixture from `@playwright/test`.
- Use `BASE_URL` from `constants-api-tests.ts` for full URLs.
- Define shared types in `lib/types/api.types.ts`.

## Error Handling Contract

- Page object and component methods that return text or components **throw `Error`** if the element is not found or has no text content.
- Never return `null` or `undefined` from page object methods.
- Example: `if (!text) throw new Error('Price text not found');`

## Accessing the Raw Page

- `BasePage.page` is `public` and can be accessed in tests: `loginPage.page`.
- Prefer page object methods when they exist; fall back to `loginPage.page` for assertions not covered by the page object (e.g. `await expect(loginPage.page).toHaveURL(...)`).

## Concurrency and Stability

- Tests run with `fullyParallel: true`, so avoid shared mutable state.
- `forbidOnly` is enforced in CI; never leave `test.only`.
