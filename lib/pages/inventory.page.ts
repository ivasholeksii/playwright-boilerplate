import { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { InventoryProductComponent } from '../components/inventory-product.component';

export class InventoryPage extends BasePage {
    private readonly url = '/inventory.html';

    private readonly product = this.page.getByTestId('inventory-item');

    constructor(page: Page) {
        super(page);
    }

    async navigate(): Promise<void> {
        await super.navigate(this.url);
    }

    async getProductByName(
        productName: string
    ): Promise<InventoryProductComponent> {
        const product = await this.product.filter({ hasText: productName });
        if (!product)
            throw new Error(`Product with name ${productName} not found`);
        return new InventoryProductComponent(product);
    }
}
