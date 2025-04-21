import { test, expect } from '@playwright/test';
import { BASE_URL } from '../constants-api-tests';
import { Post } from './types/types';

test.describe('Posts endpoint tests', () => {
    const url = `${BASE_URL}/posts`;

    test('GET /posts/# should return specific post', async ({ request }) => {
        const response = await request.get(`${url}/1`);
        expect(response.status()).toBe(200);
        const post = await response.json();
        expect(post.userId).toBe(1);
        expect(post.id).toBe(1);
    });

    test('POST /posts/ should add specific post', async ({ request }) => {
        const post: Post = {
            title: 'some dummy title',
            body: 'dummy data',
            userId: 1,
        };

        const response = await request.post(`${url}`);
        expect(response.status()).toBe(201);
        const postResponse = await response.json();
        expect(postResponse.id).toBeTruthy();
        expect(postResponse.id).toBeGreaterThan(0);
    });
});
