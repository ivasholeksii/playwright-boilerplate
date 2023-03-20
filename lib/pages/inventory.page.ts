import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class InventoryPage extends BasePage {
    private readonly menuButton = '.bm-burger-button button';
    private readonly closeButton = '.bm-cross-button button';
    private readonly allItemsLink = '#inventory_sidebar_link';
    private readonly aboutPageLink = '#about_sidebar_link';
    private readonly logoutLink = '#logout_sidebar_link';
    private readonly resetLink = '#reset_sidebar_link';
    private readonly shoppingCartBadge = '.shopping_cart_badge';
    private readonly shoppingCartLink = '.shopping_cart_link';
    private readonly productSortContainer = '.product_sort_container';
    private readonly inventoryItemName = '.inventory_item_name';
    private readonly inventoryItemPrice = '.inventory_item_price';
    private readonly inventoryItemDescription = '.inventory_item_desc';
    private readonly addToCartButton = '.inventory_item button';

    constructor(page: Page) {
        super(page);
    }

    async openMenu(): Promise<void> {
        await this.page.click(this.menuButton);
    }

    async closeMenu(): Promise<void> {
        await this.page.click(this.closeButton);
    }

    async selectAllItems(): Promise<void> {
        await this.page.click(this.allItemsLink);
    }

    async visitAboutPage(): Promise<void> {
        await this.page.click(this.aboutPageLink);
    }

    async logout(): Promise<void> {
        await this.page.click(this.logoutLink);
    }

    async resetAppState(): Promise<void> {
        await this.page.click(this.resetLink);
    }

    async getShoppingCartBadgeCount(): Promise<number> {
        const badge = await this.page.locator(this.shoppingCartBadge);
        return parseInt((await badge.textContent()) ?? '0');
    }

    async openShoppingCart(): Promise<void> {
        await this.page.click(this.shoppingCartLink);
    }

    async sortProductsBy(value: string): Promise<void> {
        await this.page.selectOption(this.productSortContainer, value);
    }

    async getProductName(productIndex: number): Promise<string> {
        const product = await this.page.locator(
            `:nth-match(${this.inventoryItemName}, ${productIndex + 1})`
        );
        const productName = await product.textContent();
        if (productName === null)
            throw new Error(`Product name is null at index ${productIndex}`);
        return productName;
    }

    async getProductPrice(productIndex: number): Promise<number> {
        const price = await this.page.locator(
            `:nth-match(${this.inventoryItemPrice}, ${productIndex + 1})`
        );
        const productPrice = await price.textContent();
        if (productPrice === null)
            throw new Error(`Product price is null at index ${productIndex}`);
        return parseFloat(productPrice.substring(1));
    }

    async getProductDescription(productIndex: number): Promise<string> {
        const description = await this.page.locator(
            `:nth-match(${this.inventoryItemDescription}, ${productIndex + 1})`
        );
        const productDescription = await description.textContent();
        if (productDescription === null)
            throw new Error(
                `Product description is null at index ${productIndex}`
            );
        return productDescription;
    }

    async addProductToCart(productIndex: number): Promise<void> {
        const addButton = await this.page.locator(
            `:nth-match(${this.addToCartButton}, ${productIndex + 1})`
        );
        await addButton.click();
    }
}
