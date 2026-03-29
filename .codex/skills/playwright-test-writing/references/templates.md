# Templates

## UI Spec Skeleton (Fixtures-based — preferred)

```ts
import { test, expect } from '../lib/fixtures';

test.describe('feature name', () => {
    test.beforeEach(async ({ inventoryPage }) => {
        await inventoryPage.navigate();
    });

    test('should do something', async ({ inventoryPage }) => {
        // actions
        // assertions
        await expect(inventoryPage.page).toHaveTitle('Swag Labs');
    });
});
```

## UI Spec Skeleton (Unauthenticated)

```ts
import { test, expect } from '../lib/fixtures';
import { BASE_URL } from '../constants';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('login', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.navigate(BASE_URL);
    });

    test('shows error for invalid credentials', async ({ loginPage }) => {
        await loginPage.enterUsername('wrong@example.com');
        await loginPage.enterPassword('wrongpassword');
        await loginPage.clickLoginButton();
        await expect(await loginPage.isErrorMessageDisplayed()).toBe(true);
    });
});
```

## Component Usage in a Test

```ts
import { test, expect } from '../lib/fixtures';

test.describe('product list', () => {
    test.beforeEach(async ({ inventoryPage }) => {
        await inventoryPage.navigate();
    });

    test('backpack price is a positive number', async ({ inventoryPage }) => {
        const backpack = await inventoryPage.getProductByName(
            'Sauce Labs Backpack'
        );
        const price = await backpack.getProductPrice();
        expect(price).toBeGreaterThan(0);
    });
});
```

## API Spec Skeleton

```ts
import { test, expect } from '@playwright/test';
import { BASE_URL } from '../constants-api-tests';

test.describe('resource endpoint tests', () => {
    const url = `${BASE_URL}/resource`;

    test('GET /resource/1 should return data', async ({ request }) => {
        const response = await request.get(`${url}/1`);
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body).toBeTruthy();
    });
});
```

## Page Object Skeleton

```ts
import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class SomePage extends BasePage {
    private readonly url = '/some-path';
    private readonly actionButton = this.page.getByTestId('action-button');

    constructor(page: Page) {
        super(page);
    }

    /** Navigates to `/some-path`. Requires authenticated storage state. */
    async navigate(): Promise<void> {
        await super.navigate(this.url);
    }

    async clickActionButton(): Promise<void> {
        await this.actionButton.click();
    }
}
```

After creating a page object, add it to `lib/pages/index.ts`:

```ts
export { SomePage } from './some.page';
```

## Component Skeleton

```ts
import { Locator } from '@playwright/test';

export class SomeComponent {
    private readonly container: Locator;

    constructor(container: Locator) {
        this.container = container;
    }

    /**
     * Returns the label text.
     * @throws {Error} if the label element has no text content.
     */
    async getLabelText(): Promise<string> {
        const text = await this.container.getByTestId('label').textContent();
        if (!text) throw new Error('Label text not found');
        return text;
    }
}
```

After creating a component, add it to `lib/components/index.ts`:

```ts
export { SomeComponent } from './some.component';
```

## Auth Setup Skeleton (for adding a new user role)

```ts
import { test as setup } from '@playwright/test';
import { BASE_URL, SOME_USER, getUserPass } from '../constants';
import { LoginPage } from '../lib/pages/login.page';
import { InventoryPage } from '../lib/pages/inventory.page';

const authFile = 'playwright/.auth/some-user.json';

setup('authenticate as some user', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate(BASE_URL);
    await loginPage.login(SOME_USER, getUserPass());

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.navigate();

    await page.context().storageState({ path: authFile });
});
```

Then add a new project entry in `playwright.config.ts` that depends on this setup and passes `storageState: authFile`.
