import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/login.page-object';

test.describe('Login Flow', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });
  
  test('deve realizar login com sucesso e redirecionar para home', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Arrange

    // Act
    await loginPage.login('alex@gmail.com', '123');

    // Assert
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Projetos')).toBeVisible();
  });

  test('deve exibir erro com email não cadastrado', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.login('email_nao_cadastrado@gmail.com', '123');
    
    // Assert usando método do POM
    await loginPage.expectEmailNotRegisteredError();
  });

  test('deve exibir erro com senha incorreta', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.login('alex@gmail.com', 'senha_incorreta');

    await loginPage.expectIncorrectPasswordError();
  })

  test('deve exibir erros do Zod quando campos estão vazios e clicar em entrar', async () => {
    await loginPage.submit();

    const emailErr = await loginPage.getErrorMessage('email');
    const passErr = await loginPage.getErrorMessage('password');

    await expect(emailErr).toHaveText('Um email válido deve ser informado.');
    await expect(passErr).toHaveText('A senha deve ser informada.');
  });

  test('deve exibir erro de email inválido enquanto digita', async () => {
    await loginPage.fillEmail('email_invalido');
    const emailErr = await loginPage.getErrorMessage('email');
    await expect(emailErr).toHaveText('Um email válido deve ser informado.');
  });

  test('deve permitir alternar a visibilidade da senha', async () => {
    await expect(loginPage.passwordInputValue).toHaveAttribute('type', 'password');

    await loginPage.passwordVisibilityButton.click();

    await expect(loginPage.passwordInputValue).toHaveAttribute('type', 'text');
  })

  test('deve mostrar estado de loading e desabilitar botão durante o login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    // MOCK: Simula uma API lenta (atraso de 2 segundos)
    await page.route('**/auth/login', async (route) => {
      await new Promise(f => setTimeout(f, 2000)); 
      await route.fulfill({ status: 200, body: JSON.stringify({ token: 'abc' }) });
    });

    await loginPage.goto();
    await loginPage.fillEmail('alex@gmail.com');
    await loginPage.fillPassword('123');

    // Clica e não aguarda o fim do redirecionamento ainda
    await loginPage.submitButtonValue.click();

    // O Vuetify adiciona a classe v-btn--loading e desabilita o elemento
    await expect(loginPage.submitButtonValue).toHaveClass(/.*v-btn--loading.*/);
  });
});