import { BasePage } from './base.page';

export class LoginPage extends BasePage {
    private readonly usernameInput = this.page.locator('#user-name');
    private readonly passwordInput = this.page.locator('#password');
    private readonly loginButton = this.page.locator('#login-button');
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

    async login(username: string, password: string): Promise<void> {
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.clickLoginButton();
    }

    isErrorMessageDisplayed(): Promise<boolean> {
        return this.errorMessageContainer.isVisible();
    }
}
