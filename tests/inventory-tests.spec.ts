import { test, expect } from '@playwright/test';
import { InventoryPage } from '../lib/pages/inventory.page';

test.describe('inventory Page tests', () => {
    let inventoryPage: InventoryPage;

    test.beforeEach(async ({ page }) => {
        inventoryPage = new InventoryPage(page);
        await inventoryPage.navigate();
        await expect(await inventoryPage.page.title()).toBe('Swag Labs');
    });

    test('user is seeing Saucelabs backpack on the list with correct details', async ({
        page,
    }) => {
        // inventoryPage is already initialized in beforeEach
        const productName = 'Sauce Labs Backpack';
        const expectedDescription =
            'carry.allTheThings() with the sleek, streamlined Sly Pack that melds uncompromising style with unequaled laptop and tablet protection.';
        const expectedPrice = '$29.99';

        // Fetch the product's description and price using methods from InventoryPage
        const description = await inventoryPage.getProductDescription(
            productName
        );
        const price = await inventoryPage.getProductPrice(productName);

        // Assert that the fetched description and price match the expected values for "Sauce Labs Backpack"
        expect(description).toBe(expectedDescription);
        expect(price).toBe(expectedPrice);
    });

    test('user can add a product to the cart and cart badge updates', async ({
        page,
    }) => {
        // inventoryPage is already initialized in beforeEach
        const productNameToAdd = 'Sauce Labs Bike Light';

        // Step 1: Add the specified product ("Sauce Labs Bike Light") to the cart
        await inventoryPage.addProductToCart(productNameToAdd);

        // Step 2: Get the current count displayed on the shopping cart badge
        const badgeCount = await inventoryPage.getShoppingCartBadgeCount();

        // Step 3: Verify that the badge count is "1", indicating one item in the cart
        expect(badgeCount).toBe('1');
    });
});
