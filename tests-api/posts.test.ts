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

        const response = await request.post(`${url}`, { data: post }); // Added post data to the request
        expect(response.status()).toBe(201);
        const postResponse = await response.json();
        expect(postResponse.id).toBeTruthy();
        // The API doesn't actually use the input post data to create the new ID,
        // so we can't check postResponse.title === post.title etc.
        // It typically returns an ID like 101 if there are 100 posts.
        expect(postResponse.id).toBeGreaterThan(0); 
    });

    test('GET /posts/# should return 404 for non-existent post', async ({
        request,
    }) => {
        // This test verifies the API's error handling for requests to non-existent resources.
        // It attempts to GET a post with an ID (e.g., 0 or 99999) that is unlikely to exist.
        const response = await request.get(`${url}/0`); // Using 0 as a non-existent ID
        expect(response.status()).toBe(404); // Expecting a 404 Not Found status code.
    });
});
