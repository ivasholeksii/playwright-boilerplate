import { BasePage } from './base.page';

export class LoginPage extends BasePage {
    private readonly usernameInput = this.page.getByTestId('username');
    private readonly passwordInput = this.page.getByTestId('password');
    private readonly loginButton = this.page.getByTestId('login-button');
    private readonly errorMessageContainer = this.page.locator(
        '.error-message-container'
    );

    async enterUsername(username: string): Promise<void> {
        await this.usernameInput.fill(username);
    }

    async enterPassword(password: string): Promise<void> {
        await this.passwordInput.fill(password);
    }

    async clickLoginButton(): Promise<void> {
        await this.loginButton.click();
    }

    async submitWithEnter(): Promise<void> {
        await this.passwordInput.press('Enter');
    }

    /**
     * Fills username and password then clicks the login button.
     * Use this for happy-path flows. For error-state tests, call
     * `enterUsername`, `enterPassword`, and `clickLoginButton` individually
     * to control which fields are populated.
     */
    async login(username: string, password: string): Promise<void> {
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.clickLoginButton();
    }

    /**
     * Returns whether the error message container is currently visible.
     * Does not wait — call this after an action that is expected to trigger an error.
     */
    isErrorMessageDisplayed(): Promise<boolean> {
        return this.errorMessageContainer.isVisible();
    }

    /**
     * Returns the trimmed text content of the error message container.
     * @throws {Error} if the element has no text content.
     */
    async getErrorMessageText(): Promise<string> {
        const text = await this.errorMessageContainer.textContent();
        if (!text) throw new Error('Error message text not found');
        return text.trim();
    }
}
