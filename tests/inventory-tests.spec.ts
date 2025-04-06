import { test, expect } from '@playwright/test';
import { InventoryPage } from '../lib/pages/inventory.page';

test.describe('Inventory Page tests', () => {
    test.beforeEach(async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        await inventoryPage.navigate();
        await expect(await inventoryPage.page.title()).toBe('Swag Labs');
    });

    // from the QA perspective test is not checking specific product requirements,
    // but as a stub to have few files for parallel run
    test('user is seeing Saucelabs backpack on the list', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        const backpack = inventoryPage.getProductByName('Sauce Labs Backpack');
        await expect(backpack).toBeTruthy();
    });
});
