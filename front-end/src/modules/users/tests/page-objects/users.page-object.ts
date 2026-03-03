import { type Locator, type Page } from '@playwright/test';

export class UsersPageObject {
  private readonly page: Page;
  private readonly nameInput: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly confirmPasswordInput: Locator;
  private readonly registerButton: Locator;
  private readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByTestId('name-input');
    this.emailInput = page.getByTestId('email-input');
    this.passwordInput = page.getByTestId('password-input');
    this.confirmPasswordInput = page.getByTestId('confirmPassword-input');
    this.registerButton = page.getByTestId('register-button');
    this.backButton = page.getByTestId('back-button');
  }

  async goto() {
    await this.page.goto('/register');
  }

  async fillName(name: string) {
    await this.nameInput.fill(name);
    await this.nameInput.blur();
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
    await this.emailInput.blur();
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
    await this.passwordInput.blur();
  }

  async fillConfirmPassword(confirmPassword: string) {
    await this.confirmPasswordInput.fill(confirmPassword);
    await this.confirmPasswordInput.blur();
  }

  async getErrorMessage(field: string) {
    return this.page.getByTestId(`${field}-input-messages`);
  }

  async submit() {
    await this.registerButton.click();
  }

  async back() {
    await this.backButton.click();
  }

  async register(name: string, email: string, password: string, confirmPassword: string) {
    await this.fillName(name);
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.fillConfirmPassword(confirmPassword);
    await this.submit();
  }
}