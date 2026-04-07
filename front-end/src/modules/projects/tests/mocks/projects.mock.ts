import type { Page } from "@playwright/test";
import type { CreateProjectDto, ListProjectDto } from "../../store/projects.store";

export const projectMock = {
  _id: '64b8c9f1e1b0c8a1b2c3d4e',
  title: 'Projeto 01',
  description: 'Nova descrição',
  createdAt: '2024-06-19T12:34:56.789Z',
  updatedAt: '2024-06-19T12:34:56.789Z',
  __v: 0,
}

export const anotherProjectMock = {
  _id: '64b8c9f1e1b0c8a1b2c3d4f',
  title: 'Outro Projeto',
  description: null,
  createdAt: '2024-06-19T12:34:56.789Z',
  updatedAt: '2024-06-19T12:34:56.789Z',
  __v: 0,
}

export const createProjectDto: CreateProjectDto = {
  title: 'Projeto 02',
  description: 'Descrição do projeto'
}

export class ProjectsMock {
  constructor(private page: Page) {}

  async mockCreateProject(createProjectDto?: CreateProjectDto, projectId?: string) {
    await this.page.route('**/projects', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          ...projectMock,
          _id: projectId ?? projectMock._id,
          title: createProjectDto?.title ?? projectMock.title,
          description: createProjectDto?.description ?? null,
        }),
      });
    })
  }

  async mockListProjects(listProjectDto?: ListProjectDto) {
    let queryString = ''

    if(listProjectDto?.keyword) queryString += `&keyword=${listProjectDto.keyword}`

    if(listProjectDto?.page) queryString += `&page=${listProjectDto.page}`

    if(listProjectDto?.limit) queryString += `&limit=${listProjectDto.limit}`

    await this.page.route(`**/projects/my-projects?${queryString}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [projectMock, anotherProjectMock],
          total: 2,
          page: listProjectDto?.page ?? 1,
          limit: listProjectDto?.limit ?? 10,
        }),
      });
    })
  }

  async mockListProjectsEmpty() {
    await this.page.route(`**/projects/my-projects?`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [],
          total: 0,
          page: 1,
          limit: 10,
        }),
      });
    })
  }

  async mockUpdateProject(projectId: string) {
    await this.page.route(`**/projects/${projectId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...projectMock,
          title: 'Projeto 01 editado',
          description: 'Descrição do projeto editada',
        }),
      });
    })
  }

  async mockDeleteProject(projectId: string) {
    await this.page.route(`**/projects/${projectId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Projeto excluído com sucesso' }),
      });
    })
  }

  async mockProjectErrorInternalError(url: string) {
    await this.page.route(`**${url}`, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Erro interno do servidor' }),
      });
    })
  }

  async mockCreateProjectErrorInternalError() {
    await this.page.route('**/projects', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Erro interno do servidor' }),
      });
    })
  }

  async mockUpdateProjectErrorInternalError() {
    await this.page.route(`**/projects/${projectMock._id}`, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Erro interno do servidor' }),
      });
    })
  }

  async mockDeleteProjectErrorInternalError() {
    await this.page.route(`**/projects/${projectMock._id}`, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Erro interno do servidor' }),
      });
    })
  }

}