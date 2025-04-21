import { test, expect } from '@playwright/test';
import { BASE_URL } from '../constants-api-tests';

test.describe('Comments endpoint tests', () => {
    test('GET /comments should return comments', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/comments`);
        expect(response.status()).toBe(200);
        const comments = await response.json();
        expect(comments.length).toBeGreaterThan(0);
    });
});
