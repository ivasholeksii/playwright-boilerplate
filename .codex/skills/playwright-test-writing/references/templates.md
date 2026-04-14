# UI Templates

> Copy-paste these skeletons and adapt names. All imports and patterns are verified against this repo.

---

## UI Spec — Authenticated

```ts
import { test, expect } from '@fixtures';

test.describe('feature name', () => {
    test.beforeEach(async ({ inventoryPage }) => {
        await inventoryPage.navigate();
    });

    test('user sees expected content', async ({ inventoryPage }) => {
        await expect(inventoryPage.page).toHaveTitle('Swag Labs');
    });
});
```

---

## UI Spec — Unauthenticated

```ts
import { test, expect } from '@fixtures';
import { STANDARD_USER, getUserPass } from '../constants';
import { getEnvironmentConfig } from '../config/environments';

// Must be at module scope — before test.describe, never inside it
test.use({ storageState: { cookies: [], origins: [] } });

const { uiBaseURL } = getEnvironmentConfig();

test.describe('login', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.navigate(uiBaseURL);
    });

    test('shows error for invalid credentials', async ({ loginPage }) => {
        await loginPage.enterUsername('wrong@example.com');
        await loginPage.enterPassword('wrongpassword');
        await loginPage.clickLoginButton();
        const isDisplayed = await loginPage.isErrorMessageDisplayed();
        expect(isDisplayed).toBe(true);
    });

    test('redirects to inventory after successful login', async ({ loginPage }) => {
        await loginPage.login(STANDARD_USER, getUserPass());
        await expect(loginPage.page).toHaveURL(/inventory\.html/);
    });
});
```

---

## UI Spec — Data-Driven

```ts
import { test, expect } from '@fixtures';
import { getEnvironmentConfig } from '../config/environments';

// Must be at module scope — before test.describe
test.use({ storageState: { cookies: [], origins: [] } });

const { uiBaseURL } = getEnvironmentConfig();

const invalidInputs = [
    '',
    ' ',
    '<script>alert("XSS")</script>',
    '"><script>alert("XSS")</script>',
    'SELECT * FROM users WHERE ""=""',
];

test.describe('invalid login inputs', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.navigate(uiBaseURL);
    });

    invalidInputs.forEach((input) => {
        test(`rejects input: "${input}"`, async ({ loginPage }) => {
            await loginPage.enterUsername(input);
            await loginPage.enterPassword(input);
            await loginPage.clickLoginButton();
            const isDisplayed = await loginPage.isErrorMessageDisplayed();
            expect(isDisplayed).toBe(true);
        });
    });
});
```

---

## UI Spec — Component Usage

```ts
import { test, expect } from '@fixtures';

test.describe('product list', () => {
    test.beforeEach(async ({ inventoryPage }) => {
        await inventoryPage.navigate();
    });

    test('backpack has a positive price', async ({ inventoryPage }) => {
        const backpack = await inventoryPage.getProductByName('Sauce Labs Backpack');
        const price = await backpack.getProductPrice();
        expect(price).toBeGreaterThan(0);
    });
});
```

---

## Page Object

```ts
import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class CheckoutPage extends BasePage {
    private readonly url = '/checkout-step-one.html';
    private readonly firstNameInput = this.page.getByTestId('firstName');
    private readonly lastNameInput = this.page.getByTestId('lastName');
    private readonly postalCodeInput = this.page.getByTestId('postalCode');
    private readonly continueButton = this.page.getByTestId('continue');

    constructor(page: Page) {
        super(page);
    }

    /** Navigates to the checkout information page. Requires authenticated storage state. */
    async navigate(): Promise<void> {
        await super.navigate(this.url);
    }

    async fillShippingInfo(firstName: string, lastName: string, zip: string): Promise<void> {
        await this.firstNameInput.fill(firstName);
        await this.lastNameInput.fill(lastName);
        await this.postalCodeInput.fill(zip);
    }

    async clickContinue(): Promise<void> {
        await this.continueButton.click();
    }
}
```

Export from `lib/pages/index.ts`:

```ts
export { CheckoutPage } from './checkout.page';
```

Then register in `lib/fixtures.ts` (see Fixture Extension template below).

---

## Fixture Extension

Add a new page object to `lib/fixtures.ts` so it is available in all UI specs:

```ts
import { test as base } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { InventoryPage } from './pages/inventory.page';
import { CheckoutPage } from './pages/checkout.page'; // 1. Import

type PageFixtures = {
    loginPage: LoginPage;
    inventoryPage: InventoryPage;
    checkoutPage: CheckoutPage; // 2. Add to type
};

export const test = base.extend<PageFixtures>({
    loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
    inventoryPage: async ({ page }, use) => { await use(new InventoryPage(page)); },
    checkoutPage: async ({ page }, use) => { await use(new CheckoutPage(page)); }, // 3. Register
});

export { expect } from '@playwright/test';
```

---

## Component

```ts
import { Locator } from '@playwright/test';

export class CartItemComponent {
    private readonly container: Locator;

    constructor(container: Locator) {
        this.container = container;
    }

    /**
     * Returns the item name text.
     * @throws {Error} if the element has no text content.
     */
    async getName(): Promise<string> {
        const text = await this.container.getByTestId('inventory-item-name').textContent();
        if (!text) throw new Error('Cart item name not found');
        return text.trim();
    }

    /**
     * Returns the item price as a float (e.g. 29.99).
     * @throws {Error} if the element has no text content.
     */
    async getPrice(): Promise<number> {
        const text = await this.container.getByTestId('inventory-item-price').textContent();
        if (!text) throw new Error('Cart item price not found');
        return parseFloat(text.replace('$', ''));
    }
}
```

Export from `lib/components/index.ts`:

```ts
export { CartItemComponent } from './cart-item.component';
```

---

## Auth Setup — New User Role

```ts
import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { SOME_USER, getUserPass } from '../constants';
import { getEnvironmentConfig } from '../config/environments';
import { LoginPage } from '../lib/pages/login.page';
import { InventoryPage } from '../lib/pages/inventory.page';

const authFile = path.join(__dirname, '../playwright/.auth/some-user.json');

setup('authenticate as some user', async ({ page }) => {
    require('dotenv').config();
    const { uiBaseURL } = getEnvironmentConfig();

    const loginPage = new LoginPage(page);
    await loginPage.navigate(uiBaseURL);
    await loginPage.login(SOME_USER, getUserPass());

    const inventoryPage = new InventoryPage(loginPage.page);
    await expect(inventoryPage.page).toHaveTitle('Swag Labs');

    await page.context().storageState({ path: authFile });
});
```

Then in `playwright.config.ts`, add a setup project and a browser project that depends on it:

```ts
{ name: 'some-user-setup', testMatch: /some-user\.setup\.ts/ },
{
    name: 'some-user-chromium',
    use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/some-user.json',
    },
    dependencies: ['some-user-setup'],
},
```
