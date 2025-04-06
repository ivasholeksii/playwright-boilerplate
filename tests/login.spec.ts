import { test, expect } from '@playwright/test';
import { BASE_URL, getUserPass, STANDARD_USER } from '../constants';
import { InventoryPage } from '../lib/pages/inventory.page';
import { LoginPage } from '../lib/pages/login.page';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('login Page tests', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.navigate(BASE_URL);
    });

    test('user is redirected to the inventory page after successful login', async () => {
        await loginPage.login(STANDARD_USER, getUserPass());
        const inventoryPage = new InventoryPage(loginPage.page);
        await expect(await inventoryPage.page.title()).toBe('Swag Labs');
    });

    test('error message displayed when invalid email or password is entered', async () => {
        await loginPage.enterUsername('wrong@example.com');
        await loginPage.enterPassword('wrongpassword');
        await loginPage.clickLoginButton();
        await expect(await loginPage.isErrorMessageDisplayed()).toBe(true);
    });

    test('user cannot login with an empty email or password', async () => {
        await loginPage.enterUsername('');
        await loginPage.enterPassword('');
        await loginPage.clickLoginButton();
        await expect(await loginPage.isErrorMessageDisplayed()).toBe(true);
    });

    test.describe('invalid inputs tests', () => {
        const invalidInputs = [
            '',
            ' ',
            '<script>alert("XSS")</script>',
            '"><script>alert("XSS")</script>',
            'javascript:alert("XSS");',
            'SELECT * FROM users WHERE username = "" OR ""="" AND password = "" OR ""="";',
            'Hello<scr<script>ipt>alert("XSS")</scr</script>ipt>',
            '',
            'áéíóúñü',
            'ÄÖÜß',
            '文武百度',
        ];

        test.beforeEach(async () => {
            await loginPage.page.reload();
        });

        invalidInputs.forEach((input) => {
            test(`user cannot login with an invalid email or password: "${input}".`, async () => {
                await loginPage.enterUsername(input);
                await loginPage.enterPassword(input);
                await loginPage.clickLoginButton();
                await expect(await loginPage.isErrorMessageDisplayed()).toBe(
                    true
                );
            });
        });
    });
});
