import { test, expect } from '@fixtures';

test.describe('inventory Page tests', () => {
    test.beforeEach(async ({ inventoryPage }) => {
        await inventoryPage.navigate();
        await expect(await inventoryPage.page.title()).toBe('Swag Labs');
    });

    // from the QA perspective test is not checking specific product requirements,
    // but as a stub to have few files for parallel run
    test('user is seeing Saucelabs backpack on the list', async ({
        inventoryPage,
    }) => {
        const backpack = inventoryPage.getProductByName('Sauce Labs Backpack');
        await expect(backpack).toBeTruthy();
    });
});
