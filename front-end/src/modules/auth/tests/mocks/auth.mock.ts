import type { BrowserContext, Page } from "@playwright/test";

export class AuthMock {
  constructor(private page: Page, private context: BrowserContext) {}

  async authMock() {
    await this.context.addCookies([
      {
        name: 'token',
        value: 'fake-jwt-token',
        url: 'http://localhost:8080',
        httpOnly: true
      }
    ])
    
    await this.page.route('**/users/me', async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            name: 'Alex',
            email: 'alex@gmail.com'
          }
        })
      })
    })
  }

  async loginMock() {
    await this.page.route('**/auth', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify('Login successful')
      })
    })
  }

  async loginEmailNotRegisteredMock() {
    await this.page.route('**/auth', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Usuário não encontrado.' })
      })
    })
  }

  async loginPasswordIncorrectMock() {
    await this.page.route('**/auth', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Senha incorreta.' })
      })
    })
  }

  async internlaErrorMock() {
    await this.page.route('**/auth', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Erro interno do servidor.' })
      })
    })
  }
}