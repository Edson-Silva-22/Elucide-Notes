import { type Locator, type Page, expect } from '@playwright/test';

//utilizando o Page Object Model (POM). O POM é um padrão de design que ajuda a organizar e estruturar os testes de forma mais eficiente, criando uma camada de abstração entre os testes e a interface do usuário. Ele facilita a manutenção dos testes, tornando-os mais legíveis e reutilizáveis.
export class LoginPage {
  // 1. Definição dos atributos (seletores)
  private readonly page: Page;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;
  private readonly passwordVisibilityBtn: Locator;


  constructor(page: Page) {
    this.page = page;
    // Usando locators resilientes
    this.emailInput = page.getByTestId('email-input');
    this.passwordInput = page.getByTestId('password-input');
    this.submitButton = page.getByTestId('login-submit');
    this.passwordVisibilityBtn = page.getByRole('button', { name: 'appended action' });
  }

  get passwordInputValue() : Locator {
    return this.passwordInput;
  }

  get submitButtonValue() : Locator {
    return this.submitButton;
  }

  get passwordVisibilityButton() : Locator {
    return this.passwordVisibilityBtn;
  }

  // 2. Ações na página
  async goto() {
    await this.page.goto('http://localhost:8080/login');
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
    // Dispara o blur para garantir que a validação ocorra se estiver configurada assim
    await this.emailInput.blur();
  }

  async fillPassword(pass: string) {
    await this.passwordInput.fill(pass);
    await this.passwordInput.blur();
  }

  async submit() {
    await this.submitButton.click();
  }

  async login(email: string, pass: string) {
    await this.fillEmail(email);
    await this.fillPassword(pass);
    await this.submitButton.click();
  }

  // Método para capturar erro específico de um campo
  async getErrorMessage(fieldName: 'email' | 'password') {
    return this.page.getByTestId(`${fieldName}-input-messages`);
  }

  // 3. Asserts específicos da página (opcional, mas recomendado)
  async expectEmailNotRegisteredError() {
    const errorMsg = this.page.getByText('Usuário não encontrado.');
    await expect(errorMsg).toBeVisible();
  }

  async expectIncorrectPasswordError() {
    const errorMsg = this.page.getByText('Senha incorreta.');
    await expect(errorMsg).toBeVisible();
  }
}