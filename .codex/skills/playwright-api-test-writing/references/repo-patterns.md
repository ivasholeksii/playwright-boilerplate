# API Repo Patterns

## Repo Map

| Path | Purpose |
|------|---------|
| `tests-api/*.test.ts` | API test files |
| `lib/types/api.types.ts` | Shared API request/response type definitions |
| `lib/types/index.ts` | Barrel re-export — `export * from './api.types'` |
| `constants-api-tests.ts` | `BASE_URL` constant |
| `playwright.api.config.ts` | API runner config (`testDir: './tests-api'`, no auth project) |

---

## Base URL

Import `BASE_URL` from `constants-api-tests` — never hard-code URLs in test files:

```ts
import { BASE_URL } from '../constants-api-tests';
// BASE_URL = 'https://jsonplaceholder.typicode.com'

// Construct per-resource URLs once at describe scope
test.describe('posts endpoint', () => {
    const url = `${BASE_URL}/posts`;
    // reuse `url` and `${url}/:id` across all tests in this describe
});
```

---

## The `request` Fixture

API tests use the built-in `request` fixture from `@playwright/test`. No page objects, no custom fixtures, no auth setup:

```ts
import { test, expect } from '@playwright/test';
import { BASE_URL } from '../constants-api-tests';

test('GET /posts', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/posts`);
    expect(response.status()).toBe(200);
});
```

Each test gets its own isolated `request` context — there is no shared session state.

---

## HTTP Methods

```ts
// GET — retrieve a resource or collection
const response = await request.get(`${url}/1`);

// POST — create a new resource
const response = await request.post(url, { data: payload });

// PUT — full replacement update
const response = await request.put(`${url}/1`, { data: payload });

// PATCH — partial update
const response = await request.patch(`${url}/1`, { data: partial });

// DELETE — remove a resource
const response = await request.delete(`${url}/1`);

// Query parameters
const response = await request.get(url, { params: { userId: 1 } });
```

---

## Assertion Order

Always assert status **first**, then parse and check the body:

```ts
const response = await request.get(`${url}/1`);

// 1. Status
expect(response.status()).toBe(200);

// 2. Parse body
const post: Post = await response.json();

// 3. Shape assertions
expect(post.id).toBe(1);
expect(post.userId).toBeGreaterThan(0);
expect(post.title).toBeTruthy();
```

**Why status first?** Parsing a body on an error response can throw or return unexpected shapes. Asserting status first gives a clear failure message.

---

## Type Definitions

All shared API shapes belong in `lib/types/api.types.ts`. Mark optional fields (absent on request body, present on response):

```ts
// lib/types/api.types.ts

export type Post = {
    id?: number;       // optional: absent in request body, present in response
    title: string;
    body: string;
    userId: number;
};

export type Comment = {
    postId: number;
    id: number;
    name: string;
    email: string;
    body: string;
};
```

`lib/types/index.ts` re-exports everything with `export * from './api.types'` — no additional change needed.

Import in tests:

```ts
import { Post, Comment } from '../lib/types';
```

---

## Concurrency

- `fullyParallel: true` — each test runs in its own isolated context
- API tests have no shared state — every test creates its own `request` context
- Never share response data between tests via module-level variables
- `forbidOnly: !!process.env.CI` — `test.only` fails CI; never commit it
- `retries: 2` on CI, `0` locally — tests must be deterministic
