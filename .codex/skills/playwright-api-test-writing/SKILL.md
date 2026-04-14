---
name: playwright-api-test-writing
description: Create or update Playwright API tests in this repo. Use when asked to add API test coverage, new test files for REST endpoints, request/response type definitions, or when following API test conventions. For UI end-to-end tests use the `playwright-test-writing` skill instead.
---

# Playwright API Test Writing

## Quick Start

1. Confirm the request is for API tests (`tests-api/` directory). For UI tests, use the `playwright-test-writing` skill instead.
2. Read `references/repo-patterns.md` for the repo map and all conventions.
3. Use `references/templates.md` as copy-paste starting points — adapt names, never invent new patterns.

---

## Step-by-Step Workflow

### Writing an API Test

1. Create or open `tests-api/<resource>.test.ts`.
2. Import `test` and `expect` from `@playwright/test` — **never** from `@fixtures`.
3. Import `BASE_URL` from `../constants-api-tests` — never hard-code URLs.
4. If the endpoint has a typed request or response: define the type in `lib/types/api.types.ts` and import via `../lib/types`.
5. Use the `request` fixture directly — no page objects, no custom fixtures.
6. Construct the full endpoint URL once at `describe` scope: `const url = \`${BASE_URL}/resource\``.
7. Assert `response.status()` **first**, then parse and assert the body.

### Adding API Types

1. Add new request/response shapes to `lib/types/api.types.ts`.
2. The barrel `lib/types/index.ts` re-exports everything — no additional change needed.
3. Import in tests via `import { MyType } from '../lib/types'`.

---

## Key Conventions — Never Deviate

| Rule | Correct | Wrong |
|------|---------|-------|
| Imports | `from '@playwright/test'` | `from '@fixtures'` |
| Base URL | `BASE_URL` from `../constants-api-tests` | Inline `'https://...'` strings |
| Fixture | `request` (built-in Playwright fixture) | Custom fixtures or page objects |
| Types | `lib/types/api.types.ts` | Inline type literals inside test files |
| Status assertion | `expect(response.status()).toBe(200)` | `expect(response.ok()).toBeTruthy()` alone |
| Endpoint URL | `\`${BASE_URL}/posts\`` at `describe` scope | Repeated inline strings per test |
| File location | `tests-api/<resource>.test.ts` | `tests/<resource>.spec.ts` |

---

## Assertion Patterns

Assert status first, then parse and shape-check the body:

```ts
// Status — always first
expect(response.status()).toBe(200);

// Parse body once
const body = await response.json();

// Shape assertions — specific values
expect(body.id).toBe(1);
expect(body.userId).toBeGreaterThan(0);

// Typed body for stricter checking
const post: Post = await response.json();
expect(post.title).toBe('expected title');

// Collection assertions
expect(Array.isArray(body)).toBe(true);
expect(body.length).toBeGreaterThan(0);
```

Do **not** assert only `response.ok()` — it passes for any 2xx status, hiding unexpected codes (e.g. 201 vs 200).

---

## Anti-Patterns

| Anti-pattern | Why | Fix |
|---|---|---|
| `import { test } from '@fixtures'` | API tests have no page object fixtures | `from '@playwright/test'` |
| Inline URL `'https://jsonplaceholder.typicode.com'` | Breaks when switching environments | `BASE_URL` from `constants-api-tests` |
| Inline type `{ id: number; title: string }` | Not reusable across test files | Add to `lib/types/api.types.ts` |
| Asserting only `response.ok()` | Passes for any 2xx — hides wrong status codes | Assert the exact expected status |
| Parsing body before asserting status | Wasteful on error responses | Status first, body second |
| API spec in `tests/` | Wrong runner (`playwright.config.ts`), wrong config | Put in `tests-api/` |
| `test.only` | Blocked by `forbidOnly: true` on CI | Remove before committing |
| Repeated URL string per test | Duplication, error-prone | Declare `const url` once at `describe` scope |

---

## Extending the Repo

| Scenario | Where |
|---|---|
| New API resource test file | `tests-api/<resource>.test.ts` |
| New request/response type | `lib/types/api.types.ts` |
| New API base URL constant | `constants-api-tests.ts` |

---

## Config Quick Reference

| Setting | Value |
|---|---|
| `testDir` | `./tests-api` |
| `fullyParallel` | `true` — tests run in parallel |
| `forbidOnly` | `true` on CI |
| `retries` | `2` on CI, `0` locally |
| Auth | None — no auth setup project for API tests |
| `baseURL` | `apiBaseURL` from `getEnvironmentConfig()` (tests use `BASE_URL` constant directly) |

---

## Checklist Before Finishing

- [ ] File is in `tests-api/` with `.test.ts` extension
- [ ] `test` and `expect` imported from `@playwright/test`, not `@fixtures`
- [ ] `BASE_URL` imported from `../constants-api-tests` — no inline URL strings
- [ ] Status code asserted before parsing body
- [ ] New types added to `lib/types/api.types.ts`
- [ ] Endpoint URL constructed once at `describe` scope, not repeated per test
- [ ] No `test.only` committed
- [ ] Tests are independent and safe to run under `fullyParallel: true`

---

## References

- `references/repo-patterns.md` — repo map, request methods, type conventions, assertion patterns
- `references/templates.md` — copy-paste skeletons for API specs and type definitions
