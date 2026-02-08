# Repo Patterns

## Repo Map

- UI specs: `tests/*.spec.ts`
- API specs: `tests-api/*.test.ts`
- Example specs: `tests-examples/` (reference only)
- Page objects: `lib/pages/*.page.ts`
- Components: `lib/components/*.component.ts`
- UI constants: `constants.ts`
- API constants: `constants-api-tests.ts`
- Auth setup: `tests/auth.setup.ts`
- UI config: `playwright.config.ts`
- API config: `playwright.api.config.ts`

## Selector and Locator Conventions

- `testIdAttribute` is set to `data-test` in `playwright.config.ts`.
- Prefer `page.getByTestId('...')`, `locator.getByTestId('...')`, and role/label queries.

## Auth and Storage State

- Auth storage is created in `tests/auth.setup.ts` and saved to `playwright/.auth/standard-user.json`.
- UI projects depend on `setup` in `playwright.config.ts` and reuse that storage state.
- For login or unauthenticated flows, clear storage with `test.use({ storageState: { cookies: [], origins: [] } })` as in `tests/login.spec.ts`.

## UI Page Object Pattern

- Extend `BasePage` and use `navigate()` to go to a path.
- Keep locators `private readonly` and provide small action methods.
- Example files: `lib/pages/login.page.ts`, `lib/pages/inventory.page.ts`.

## API Test Pattern

- Use the `request` fixture from `@playwright/test`.
- Use `BASE_URL` from `constants-api-tests.ts` for full URLs.
- Define shared types in `tests-api/types/types.ts`.

## Concurrency and Stability

- Tests run with `fullyParallel: true`, so avoid shared mutable state.
- `forbidOnly` is enforced in CI; never leave `test.only`.
