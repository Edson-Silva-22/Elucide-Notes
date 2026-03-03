import { test, expect } from '@playwright/test';
import { UsersPageObject } from '../page-objects/users.page-object';
import { UsersMock } from '../mocks/users.mock';

test.describe('User Registration Flow', () => {
  let usersPageObject: UsersPageObject;
  let usersMock: UsersMock;

  test.beforeEach(async ({ page }) => {
    usersPageObject = new UsersPageObject(page);
    usersMock = new UsersMock(page);
    await usersPageObject.goto();
  });

  test('Deve ser possível resgistrar um novo usuário', async ({ page }) => {
    await usersMock.mockRegisterUser();
    
    await usersPageObject.register('Novo Usuário', 'novo_usuario@gmail.com', '123', '123')

    await expect(page).toHaveURL('/login');
    await expect(page.getByText('Elucide Notes')).toBeVisible();
  })

  test('Deve exibir mensagem de erro ao tentar registrar um usuário com email já cadastrado', async ({ page }) => {
    await usersMock.mockRegisterUserError();
    
    await usersPageObject.register('Novo Usuário', 'novo_usuario@gmail.com', '123', '123')

    await expect(page).toHaveURL('/register');
    await expect(page.getByText('Email já cadastrado')).toBeVisible();
  })

  test('Deve exibir erros de validação do Zod quando campos estão vazios e clicar em registrar', async () => {
    await usersPageObject.submit();
    
    const nameErr = await usersPageObject.getErrorMessage('name');
    const emailErr = await usersPageObject.getErrorMessage('email');
    const passwordErr = await usersPageObject.getErrorMessage('password');
    const confirmPasswordErr = await usersPageObject.getErrorMessage('confirmPassword');

    await expect(nameErr).toHaveText('O nome deve ser informado.');
    await expect(emailErr).toHaveText('Um email válido deve ser informado.');
    await expect(passwordErr).toHaveText('A senha deve ser informada.');
    await expect(confirmPasswordErr).toHaveText('A senha deve ser confirmada');
  })

  test('Deve exibir erro quando a senha não é igual a confirmação de senha', async () => {
    await usersPageObject.fillPassword('123');
    await usersPageObject.fillConfirmPassword('1234');

    const confirmPasswordErr = await usersPageObject.getErrorMessage('confirmPassword');
    await expect(confirmPasswordErr).toHaveText('As senhas devem ser iguais');
  })

  test('Deve exibir mensagem de erro de servidor', async ({ page }) => {
    await usersMock.mockRegisterUserIntenalError();
    
    await usersPageObject.register('Novo Usuário', 'novo_usuario@gmail.com', '123', '123')

    await expect(page.getByText('Erro interno do servidor')).toBeVisible();
  })

  test('Deve ser possível voltar para a tela de login clicando no botão de voltar', async ({ page }) => {
    await usersPageObject.back();

    await expect(page).toHaveURL('/login');
    await expect(page.getByText('Elucide Notes')).toBeVisible();
  })
})
