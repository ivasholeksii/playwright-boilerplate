import { Page, Locator } from '@playwright/test';

export class InventoryProductComponent {
    private readonly container: Locator;

    constructor(container: Locator) {
        this.container = container;
    }

    async getProductPrice(): Promise<number> {
        const priceText = await this.container
            .getByTestId('inventory-item-price')
            .textContent();
        if (!priceText) throw new Error('Price text not found');
        return parseFloat(priceText.replace('$', ''));
    }
}
