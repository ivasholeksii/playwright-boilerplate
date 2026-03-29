import { Page } from '@playwright/test';

export abstract class BasePage {
    /** The raw Playwright page. Accessible in tests via `somePage.page` when no page object method covers the needed assertion. */
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async navigate(url: string): Promise<void> {
        await this.page.goto(url);
    }
}
