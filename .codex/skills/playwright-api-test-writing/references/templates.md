# API Templates

> Copy-paste these skeletons and adapt names. All imports and patterns are verified against this repo.

---

## API Spec — Full CRUD

```ts
import { test, expect } from '@playwright/test';
import { BASE_URL } from '../constants-api-tests';
import { Post } from '../lib/types';

test.describe('posts endpoint', () => {
    const url = `${BASE_URL}/posts`;

    test('GET /posts returns a non-empty array', async ({ request }) => {
        const response = await request.get(url);
        expect(response.status()).toBe(200);
        const posts = await response.json();
        expect(Array.isArray(posts)).toBe(true);
        expect(posts.length).toBeGreaterThan(0);
    });

    test('GET /posts/:id returns the post', async ({ request }) => {
        const response = await request.get(`${url}/1`);
        expect(response.status()).toBe(200);
        const post: Post = await response.json();
        expect(post.id).toBe(1);
        expect(post.userId).toBeGreaterThan(0);
        expect(post.title).toBeTruthy();
    });

    test('POST /posts creates a new post', async ({ request }) => {
        const payload: Post = { title: 'test title', body: 'test body', userId: 1 };
        const response = await request.post(url, { data: payload });
        expect(response.status()).toBe(201);
        const created: Post = await response.json();
        expect(created.id).toBeTruthy();
    });

    test('PUT /posts/:id replaces the post', async ({ request }) => {
        const payload: Post = { title: 'updated title', body: 'updated body', userId: 1 };
        const response = await request.put(`${url}/1`, { data: payload });
        expect(response.status()).toBe(200);
        const updated: Post = await response.json();
        expect(updated.title).toBe('updated title');
    });

    test('DELETE /posts/:id removes the post', async ({ request }) => {
        const response = await request.delete(`${url}/1`);
        expect(response.status()).toBe(200);
    });
});
```

---

## API Spec — GET Collection with Query Params

```ts
import { test, expect } from '@playwright/test';
import { BASE_URL } from '../constants-api-tests';
import { Comment } from '../lib/types';

test.describe('comments endpoint', () => {
    const url = `${BASE_URL}/comments`;

    test('GET /comments returns a non-empty array', async ({ request }) => {
        const response = await request.get(url);
        expect(response.status()).toBe(200);
        const comments: Comment[] = await response.json();
        expect(Array.isArray(comments)).toBe(true);
        expect(comments.length).toBeGreaterThan(0);
    });

    test('GET /comments?postId=1 filters by post', async ({ request }) => {
        const response = await request.get(url, { params: { postId: 1 } });
        expect(response.status()).toBe(200);
        const comments: Comment[] = await response.json();
        expect(comments.length).toBeGreaterThan(0);
        expect(comments.every((c) => c.postId === 1)).toBe(true);
    });
});
```

---

## API Spec — Error Responses

```ts
import { test, expect } from '@playwright/test';
import { BASE_URL } from '../constants-api-tests';

test.describe('posts endpoint — error cases', () => {
    const url = `${BASE_URL}/posts`;

    test('GET /posts/:id returns 404 for non-existent id', async ({ request }) => {
        const response = await request.get(`${url}/999999`);
        expect(response.status()).toBe(404);
    });
});
```

---

## API Spec — PATCH (partial update)

```ts
import { test, expect } from '@playwright/test';
import { BASE_URL } from '../constants-api-tests';
import { Post } from '../lib/types';

test.describe('posts endpoint — patch', () => {
    const url = `${BASE_URL}/posts`;

    test('PATCH /posts/:id updates only the provided fields', async ({ request }) => {
        const response = await request.patch(`${url}/1`, {
            data: { title: 'patched title' },
        });
        expect(response.status()).toBe(200);
        const updated: Post = await response.json();
        expect(updated.title).toBe('patched title');
    });
});
```

---

## Type Definition

Add to `lib/types/api.types.ts`:

```ts
export type Comment = {
    postId: number;
    id: number;
    name: string;
    email: string;
    body: string;
};

export type Todo = {
    userId: number;
    id?: number;        // absent in request body, present in response
    title: string;
    completed: boolean;
};
```

`lib/types/index.ts` already re-exports everything — no additional change needed.

Import in a test:

```ts
import { Comment, Todo } from '../lib/types';
```
