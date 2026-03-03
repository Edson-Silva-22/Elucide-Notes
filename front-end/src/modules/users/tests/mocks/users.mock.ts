import type { Page } from "@playwright/test";

export const usersResponse = {
  success: {
    user: {
      _id: '64b8c9f1e1b0c8a1b2c3d4e',
      name: 'John Doe',
      email: 'john@email.com',
      createdAt: '2024-06-19T12:34:56.789Z',
      updatedAt: '2024-06-19T12:34:56.789Z',
      __v: 0,
    },
  },
  error: {
    message: 'Email já cadastrado',
  }
}

export class UsersMock {
  constructor(private page: Page) {}

  async mockRegisterUser() {
    await this.page.route('**/users', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(usersResponse.success),
      });
    })
  }

  async mockRegisterUserError() {
    await this.page.route('**/users', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify(usersResponse.error),
      });
    })
  }

  async mockRegisterUserIntenalError() {
    await this.page.route('**/users', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Erro interno do servidor' }),
      });
    })
  }
}