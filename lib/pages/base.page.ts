import { Page } from '@playwright/test';

export abstract class BasePage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async navigate(url: string): Promise<void> {
        await this.page.goto(url);
    }
}
