import { test as setup, expect } from '@playwright/test';
import path from 'path';

import { STANDARD_USER, getUserPass } from '../constants';
import { getEnvironmentConfig } from '../config/environments';
import { InventoryPage } from '../lib/pages/inventory.page';
import { LoginPage } from '../lib/pages/login.page';

const authFile = path.join(__dirname, '../playwright/.auth/standard-user.json');

setup('authenticate as standard user', async ({ page }) => {
    require('dotenv').config();

    const { uiBaseURL } = getEnvironmentConfig();
    const loginPage = new LoginPage(page);
    await loginPage.navigate(uiBaseURL);
    await loginPage.login(STANDARD_USER, getUserPass());

    const inventoryPage = new InventoryPage(loginPage.page);
    await expect(await inventoryPage.page.title()).toBe('Swag Labs');

    await page.context().storageState({ path: authFile });
});
