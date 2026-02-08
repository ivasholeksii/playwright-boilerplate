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

    async login(username: string, password: string): Promise<void> {
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.clickLoginButton();
    }

    isErrorMessageDisplayed(): Promise<boolean> {
        return this.errorMessageContainer.isVisible();
    }

    async getErrorMessageText(): Promise<string> {
        const text = await this.errorMessageContainer.textContent();
        if (!text) throw new Error('Error message text not found');
        return text.trim();
    }
}
