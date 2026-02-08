# Templates

## UI Spec Skeleton

```ts
import { test, expect } from '@playwright/test';
import { BASE_URL } from '../constants';
import { SomePage } from '../lib/pages/some.page';

test.describe('feature name', () => {
    let somePage: SomePage;

    test.beforeEach(async ({ page }) => {
        somePage = new SomePage(page);
        await somePage.navigate(BASE_URL);
    });

    test('should do something', async () => {
        // actions
        // assertions
        await expect(somePage.page).toHaveTitle('Swag Labs');
    });
});
```

## UI Spec Skeleton (Unauthenticated)

```ts
import { test, expect } from '@playwright/test';
import { BASE_URL } from '../constants';
import { LoginPage } from '../lib/pages/login.page';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('login', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.navigate(BASE_URL);
    });

    test('shows error for invalid credentials', async () => {
        await loginPage.enterUsername('wrong@example.com');
        await loginPage.enterPassword('wrongpassword');
        await loginPage.clickLoginButton();
        await expect(await loginPage.isErrorMessageDisplayed()).toBe(true);
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

    async navigate(): Promise<void> {
        await super.navigate(this.url);
    }

    async clickActionButton(): Promise<void> {
        await this.actionButton.click();
    }
}
```

## Component Skeleton

```ts
import { Locator } from '@playwright/test';

export class SomeComponent {
    private readonly container: Locator;

    constructor(container: Locator) {
        this.container = container;
    }

    async getLabelText(): Promise<string> {
        const text = await this.container.getByTestId('label').textContent();
        if (!text) throw new Error('Label text not found');
        return text;
    }
}
```
