import { test, expect } from '@fixtures';
import { getUserPass, LOCKED_OUT_USER, STANDARD_USER } from '../constants';
import { getEnvironmentConfig } from '../config/environments';

const { uiBaseURL } = getEnvironmentConfig();

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('login Page tests', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.navigate(uiBaseURL);
    });

    test('user is redirected to the inventory page after successful login', async ({
        loginPage,
    }) => {
        await loginPage.login(STANDARD_USER, getUserPass());
        await expect(await loginPage.page.title()).toBe('Swag Labs');
    });

    test('error message displayed when invalid email or password is entered', async ({
        loginPage,
    }) => {
        await loginPage.enterUsername('wrong@example.com');
        await loginPage.enterPassword('wrongpassword');
        await loginPage.clickLoginButton();
        await expect(await loginPage.isErrorMessageDisplayed()).toBe(true);
    });

    test('user cannot login with an empty email or password', async ({
        loginPage,
    }) => {
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
            '',
            'áéíóúñü',
            'ÄÖÜß',
            '文武百度',
        ];

        test.beforeEach(async ({ loginPage }) => {
            await loginPage.page.reload();
        });

        invalidInputs.forEach((input) => {
            test(`user cannot login with an invalid email or password: "${input}".`, async ({
                loginPage,
            }) => {
                await loginPage.enterUsername(input);
                await loginPage.enterPassword(input);
                await loginPage.clickLoginButton();
                await expect(await loginPage.isErrorMessageDisplayed()).toBe(
                    true
                );
            });
        });
    });

    test('locked out user cannot login and sees locked out error', async ({
        loginPage,
    }) => {
        await loginPage.login(LOCKED_OUT_USER, getUserPass());
        await expect(await loginPage.isErrorMessageDisplayed()).toBe(true);
        const errorText = await loginPage.getErrorMessageText();
        expect(errorText.toLowerCase()).toContain('locked out');
    });

    test('user can submit login with Enter key', async ({ loginPage }) => {
        await loginPage.enterUsername(STANDARD_USER);
        await loginPage.enterPassword(getUserPass());
        await loginPage.submitWithEnter();
        await expect(loginPage.page).toHaveURL(/inventory\.html/);
    });
});
