import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
// import { InventoryProductComponent } from '../components/inventory-product.component'; // Not used for now

export class InventoryPage extends BasePage {
    private readonly url = '/inventory.html';

    // General locator for a product item, can be refined if needed
    // private readonly productItem = this.page.locator('.inventory_item'); // More specific alternative below

    /**
     * Locator for the shopping cart badge, typically displaying the number of items in the cart.
     */
    public readonly shoppingCartBadge: Locator;

    constructor(page: Page) {
        super(page);
        this.shoppingCartBadge = this.page.locator(
            'span.shopping_cart_badge'
        );
    }

    /**
     * Navigates to the inventory page of the application.
     * @returns A promise that resolves when navigation is complete.
     */
    async navigate(): Promise<void> {
        await super.navigate(this.url);
    }

    /**
     * Retrieves the main container locator for a product, identified by its name.
     * This is a private helper method used by other public methods to interact with product elements.
     * @param productName The name of the product as displayed on the UI.
     * @returns A Playwright Locator for the product's container element.
     * Assumes product names are unique and located within a 'div.inventory_item_name'
     * inside the main 'div.inventory_item' container.
     */
    private getProductContainerByName(productName: string): Locator {
        return this.page.locator(
            `//div[@class='inventory_item' and .//div[@class='inventory_item_name' and text()='${productName}']]`
        );
    }

    /**
     * Retrieves the visible description text for a given product.
     * @param productName The name of the product as displayed on the UI.
     * @returns A promise that resolves to the description text as a string, or null if the product or description is not found.
     */
    async getProductDescription(
        productName: string
    ): Promise<string | null> {
        const productContainer = this.getProductContainerByName(productName);
        return productContainer
            .locator('.inventory_item_desc')
            .textContent();
    }

    /**
     * Retrieves the visible price text for a given product.
     * @param productName The name of the product as displayed on the UI.
     * @returns A promise that resolves to the price text as a string (e.g., "$29.99"), or null if the product or price is not found.
     */
    async getProductPrice(productName: string): Promise<string | null> {
        const productContainer = this.getProductContainerByName(productName);
        return productContainer.locator('.inventory_item_price').textContent();
    }

    /**
     * Clicks the "Add to cart" button for a specified product.
     * Assumes the button has text like "Add to cart" (case-insensitive).
     * @param productName The name of the product to add to the cart.
     * @returns A promise that resolves when the click action is performed.
     */
    async addProductToCart(productName: string): Promise<void> {
        const productContainer = this.getProductContainerByName(productName);
        await productContainer
            .locator("button:text-matches('Add to cart', 'i')") // Case-insensitive match
            .click();
    }

    /**
     * Retrieves the text content of the shopping cart badge.
     * This typically represents the number of items in the cart.
     * @returns A promise that resolves to the badge count as a string, or null if the badge is not visible (e.g., when the cart is empty).
     */
    async getShoppingCartBadgeCount(): Promise<string | null> {
        if (await this.shoppingCartBadge.isVisible()) {
            return this.shoppingCartBadge.textContent();
        }
        return null;
    }

    // Original getProductByName can be kept if InventoryProductComponent is developed later
    // async getProductByName(
    //     productName: string
    // ): Promise<InventoryProductComponent> {
    //     const productContainer = this.getProductContainerByName(productName);
    //     await productContainer.waitFor({ state: 'visible' }); // Ensure container exists
    //     return new InventoryProductComponent(productContainer);
    // }
}
