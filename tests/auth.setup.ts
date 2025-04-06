import { test as setup, expect } from '@playwright/test';
import path from 'path';

import { BASE_URL, STANDARD_USER, getUserPass } from '../constants';
import { InventoryPage } from '../lib/pages/inventory.page';
import { LoginPage } from '../lib/pages/login.page';

const authFile = path.join(__dirname, '../playwright/.auth/standard-user.json');

setup('authenticate as standard user', async ({ page }) => {
    require('dotenv').config();

    const loginPage = new LoginPage(page);
    await loginPage.navigate(BASE_URL);
    await loginPage.login(STANDARD_USER, getUserPass());

    const inventoryPage = new InventoryPage(loginPage.page);
    await expect(await inventoryPage.page.title()).toBe('Swag Labs');

    await page.context().storageState({ path: authFile });
});
