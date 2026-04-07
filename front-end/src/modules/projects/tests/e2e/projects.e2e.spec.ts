import test, { expect } from "@playwright/test";
import { ProjectsPageObject } from "../page-objects/projects.page-object";
import { anotherProjectMock, createProjectDto, projectMock, ProjectsMock } from "../mocks/projects.mock";
import { AuthMock } from "@/modules/auth/tests/mocks/auth.mock";

test.describe('Fluxos da tela de projetos', () => {
  let projectsPageObject: ProjectsPageObject;
  let projectsMock: ProjectsMock;
  let authMock: AuthMock;

  test.beforeEach(async ({ page, context }) => {
    projectsPageObject = new ProjectsPageObject(page);
    projectsMock = new ProjectsMock(page);
    authMock = new AuthMock(page, context);
    
    await authMock.authMock();
    await projectsPageObject.goto();
  })

  test.describe('Criação de projetos', () => {
    test('Deve criar um novo projeto', async ({ page }) => {
      await projectsMock.mockListProjects();
      await projectsMock.mockCreateProject(createProjectDto);
  
      await projectsPageObject.openCreateProjectDialog();
      await projectsPageObject.dialogIsOpen();
  
      await projectsPageObject.fillCreateProjectForm(createProjectDto.title, createProjectDto.description!);
      await projectsPageObject.submitCreateProjectForm();
  
      await projectsPageObject.dialogIsClosed();
  
      await expect(page).toHaveURL('/');
      await expect(page.getByText(createProjectDto.title)).toBeVisible();
      await expect(page.getByText(createProjectDto.description!)).toBeVisible();
    })  
  
    test('Deve exibir mensagens de erro para campos que não passaram na validação do formulário', async ({ page }) => {
      await projectsMock.mockListProjects();

      await projectsPageObject.openCreateProjectDialog();
      await projectsPageObject.dialogIsOpen();
  
      await projectsPageObject.submitCreateProjectForm();
  
      await projectsPageObject.dialogIsOpen();
  
      const titleErr = await projectsPageObject.getErrorMessage('title');
  
      await expect(page).toHaveURL('/')
      await expect(titleErr).toHaveText('O título do projeto deve ser informado.');
    })
  
    test('Deve exibir mensagem de erro de servidor', async ({ page }) => {
      await projectsMock.mockListProjects();
      await projectsMock.mockProjectErrorInternalError('/projects');
  
      await projectsPageObject.openCreateProjectDialog();
      await projectsPageObject.dialogIsOpen();
  
      await projectsPageObject.fillCreateProjectForm(createProjectDto.title, createProjectDto.description!);
      await projectsPageObject.submitCreateProjectForm();
  
      await projectsPageObject.dialogIsOpen();
  
      await expect(page.getByText('Erro interno do servidor')).toBeVisible();
    })
  })
  
  test.describe('Listagem de projetos', () => {
    test('Deve listar os projetos cadastrados', async ({ page }) => {
      await projectsMock.mockListProjects();
  
      await expect(page).toHaveURL('/');
      await expect(page.getByText('Projeto 01')).toBeVisible();
    })

    test('Deve exibir uma descrição padrão para projetos sem descrição', async ({ page }) => {
      await projectsMock.mockListProjects();

      await expect(page).toHaveURL('/');
      await expect(page.getByText('Outro Projeto')).toBeVisible();
      await expect(page.getByText('Sem descrição')).toBeVisible();
    })

    test('Deve listar os projetos de acordo com a paginação, keyword e filtro', async ({ page }) => {
      await projectsMock.mockListProjects()
      await projectsMock.mockListProjects({
        page: 2,
        limit: 5,
        keyword: 'projeto',
      });

      await projectsPageObject.fillKeyword('projeto');
  
      await expect(page).toHaveURL('/');
      await expect(page.getByText('Projeto 01')).toBeVisible();
    })

    test('Deve exibir progresso circular enquanto carrega os dados', async ({ page }) => {
      new Promise(f => setTimeout(f, 4000));
      await projectsMock.mockListProjects();
  
      await projectsPageObject.progressCircularIsVisible();
      await projectsPageObject.progressCircularIsHidden();
      
      await expect(page).toHaveURL('/');
      await expect(page.getByText('Projeto 01')).toBeVisible();
    })

    test('Deve exibir texto padrão quando não há projetos cadastrados', async ({ page }) => {
      await projectsMock.mockListProjectsEmpty();
  
      await expect(page).toHaveURL('/');
      await expect(page.getByText('Nenhum projeto encontrado')).toBeVisible();
    })
  })

  test.describe('Visualização de projetos', () => {
    test('Deve exibir os detalhes do projeto', async ({ page }) => {
      await projectsMock.mockListProjects();

      await projectsPageObject.openProjectCardMenu();
      await projectsPageObject.openViewProjectDialog();
      await projectsPageObject.viewProjectDialogIsVisible();

      await expect(page.getByText(projectMock.title).last()).toBeVisible();
      await expect(page.getByText(projectMock.description).last()).toBeVisible();
      await projectsPageObject.closeViewProjectDialog();

      await projectsPageObject.viewProjectDialogIsHidden();
    }) 

    test('Deve exibir mensagem padrão para projetos sem descrição', async ({ page }) => {
      await projectsMock.mockListProjects();

      await projectsPageObject.openProjectCardMenu(anotherProjectMock._id);
      await projectsPageObject.openViewProjectDialog();
      await projectsPageObject.viewProjectDialogIsVisible();

      await expect(page.getByText(projectMock.title).last()).toBeVisible();
      await expect(page.getByText('Sem descrição').last()).toBeVisible();
      await projectsPageObject.closeViewProjectDialog();

      await projectsPageObject.viewProjectDialogIsHidden();
    })
  })

  test.describe('Edição de projetos', () => {
    test('Deve editar um projeto', async ({ page }) => {
      await projectsMock.mockListProjects();
      await projectsMock.mockUpdateProject(projectMock._id);

      await projectsPageObject.openProjectCardMenu();
      await projectsPageObject.openEditProjectDialog();
      await projectsPageObject.editProjectDialogIsVisible();

      await projectsPageObject.fillEditProjectForm('Projeto Editado', 'Descrição do projeto');

      await projectsPageObject.saveEditedProject();
      
      await projectsPageObject.editProjectDialogIsHidden();
      await expect(page.getByText('Projeto Editado')).toBeVisible();
      await expect(page.getByText('Descrição do projeto')).toBeVisible();
    })

    test('Deve exibir mensagens de erro para campos que não passaram na validação do formulário', async ({ page }) => {
      await projectsMock.mockListProjects();
      await projectsMock.mockUpdateProject(projectMock._id);

      await projectsPageObject.openProjectCardMenu();
      await projectsPageObject.openEditProjectDialog();
      await projectsPageObject.editProjectDialogIsVisible();

      await projectsPageObject.fillEditProjectForm('');

      await projectsPageObject.saveEditedProject();
      
      await projectsPageObject.editProjectDialogIsVisible();

      const titleErr = await projectsPageObject.getErrorMessage('title-edit');
  
      await expect(page).toHaveURL('/')
      await expect(titleErr).toHaveText('O título do projeto deve ser informado.');
    })

    test('Deve exibir mensagem de erro de servidor', async ({ page }) => {
      await projectsMock.mockListProjects();
      await projectsMock.mockProjectErrorInternalError('/projects/' + projectMock._id);

      await projectsPageObject.openProjectCardMenu();
      await projectsPageObject.openEditProjectDialog();
      await projectsPageObject.editProjectDialogIsVisible();

      await projectsPageObject.fillEditProjectForm('Projeto Editado', 'Descrição do projeto');

      await projectsPageObject.saveEditedProject();
      
      // await projectsPageObject.editProjectDialogIsVisible();
      
      await expect(page.getByText('Erro interno do servidor')).toBeVisible();
    })
  })

  test.describe('Exclusão de projetos', () => {
    test('Deve excluir um projeto', async ({ page }) => {
      await projectsMock.mockListProjects();
      await projectsMock.mockDeleteProject(projectMock._id);

      await projectsPageObject.openProjectCardMenu();
      await projectsPageObject.openDeleteProjectDialog();
      await projectsPageObject.deleteProjectDialogIsVisible();
      
      await projectsPageObject.confirmDeleteProject();

      await projectsPageObject.deleteProjectDialogIsHidden();

      await expect(page.getByText(projectMock.title)).not.toBeVisible();
    })

    test('Deve exibir mensagem de erro de servidor', async ({ page }) => {
      await projectsMock.mockListProjects();
      await projectsMock.mockProjectErrorInternalError('/projects/' + projectMock._id);

      await projectsPageObject.openProjectCardMenu();
      await projectsPageObject.openDeleteProjectDialog();
      await projectsPageObject.deleteProjectDialogIsVisible();
      
      await projectsPageObject.confirmDeleteProject();

      await projectsPageObject.deleteProjectDialogIsHidden();
      
      await expect(page.getByText('Erro interno do servidor')).toBeVisible();
      
    })
  })

  test.describe('Seleção de projetos', () => {
    test('Deve selecionar um projeto', async ({ page }) => {
      await projectsMock.mockListProjects();

      await projectsPageObject.selectProject();

      await projectsPageObject.openNavBar();
      
      await expect(page).toHaveURL('/tasks');
      await expect(page.getByText('Visualize e gerencie as tarefas do seu projeto').last()).toBeVisible();
      await expect(page.getByText(projectMock.title)).toBeVisible();
    })

    test('Deve manter o projeto selecionado ao atualizar a página', async ({ page }) => {
      await projectsMock.mockListProjects();

      await projectsPageObject.selectProject();

      await expect(page).toHaveURL('/tasks');
      await expect(page.getByText('Visualize e gerencie as tarefas do seu projeto').last()).toBeVisible();

      await projectsPageObject.openNavBar();
      await expect(page.getByText(projectMock.title)).toBeVisible();

      await page.reload();

      await projectsPageObject.openNavBar();
      await expect(page.getByText(projectMock.title)).toBeVisible();
    })

    test('Deve trocar o projeto selecionado', async ({ page }) => {
      await projectsMock.mockListProjects();

      await projectsPageObject.selectProject();
      await projectsPageObject.openNavBar();

      await expect(page).toHaveURL('/tasks');
      await expect(page.getByText('Visualize e gerencie as tarefas do seu projeto').last()).toBeVisible();
      await expect(page.getByText(projectMock.title)).toBeVisible();

      await page.getByText(projectMock.title).click();

      await expect(page).toHaveURL('/');
      await projectsPageObject.projectIsSelected(projectMock._id);

      await projectsPageObject.selectProject(anotherProjectMock._id);

      await expect(page).toHaveURL('/tasks');
      await expect(page.getByText('Visualize e gerencie as tarefas do seu projeto').last()).toBeVisible();
      await expect(page.getByText('Outro Projeto')).toBeVisible();

      await page.getByText('Outro Projeto').click();
      await expect(page).toHaveURL('/');
      await projectsPageObject.projectIsSelected(anotherProjectMock._id);
    })
  })
})