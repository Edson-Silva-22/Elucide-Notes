import { expect, type Locator, type Page } from "@playwright/test";
import { projectMock } from "../mocks/projects.mock";

export class ProjectsPageObject {
  private readonly page: Page;
  private readonly createProjetctDialogButton: Locator;
  private readonly titleInput: Locator;
  private readonly descriptionInput: Locator;
  private readonly titleEditInput: Locator;
  private readonly descriptionEditInput: Locator;
  private readonly createProjectButton: Locator;
  private readonly dialog: Locator;
  private readonly keywordInput: Locator;
  private readonly progressCircular: Locator;
  private btnProjectCardMenu: Locator;
  private readonly viewProjectDialog: Locator;
  private readonly closeViewProjectDialogButton: Locator;
  private readonly viewProjectDialogButton: Locator;
  private readonly editProjectDialog: Locator;
  private readonly editProjectDialogButton: Locator;
  private readonly editProjectSaveButton: Locator;
  private readonly deleteProjectDialog: Locator;
  private readonly comfirmDeleteProjectButton: Locator;
  private readonly deleteProjectDialogButton: Locator;
  private projectCard: Locator;
  private readonly navBarButton: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.createProjetctDialogButton = page.getByTestId('create-project-dialog-button');
    this.titleInput = page.getByTestId('title-input');
    this.descriptionInput = page.getByTestId('description-input');
    this.titleEditInput = page.getByTestId('title-edit-input');
    this.descriptionEditInput = page.getByTestId('description-edit-input');
    this.createProjectButton = page.getByTestId('create-project-button');
    this.dialog = page.getByTestId('create-project-dialog');
    this.keywordInput = page.getByTestId('keyword-input');
    this.progressCircular = page.getByTestId('progress-circular');
    this.btnProjectCardMenu = page.getByTestId(`btn-project-card-menu-${projectMock._id}`);
    this.viewProjectDialog = page.getByTestId('view-project-dialog');
    this.closeViewProjectDialogButton = page.getByTestId('close-view-project-dialog-button');
    this.viewProjectDialogButton = page.getByTestId('view-project-dialog-button');
    this.editProjectDialog = page.getByTestId('edit-project-dialog');
    this.editProjectDialogButton = page.getByTestId('edit-project-dialog-button');
    this.editProjectSaveButton = page.getByTestId('edit-project-save-button');
    this.deleteProjectDialog = page.getByTestId('delete-project-dialog');
    this.comfirmDeleteProjectButton = page.getByTestId('comfirm-delete-project-button');
    this.deleteProjectDialogButton = page.getByTestId('delete-project-dialog-button');
    this.projectCard = page.getByTestId(`project-card-${projectMock._id}`);
    this.navBarButton = page.getByTestId('nav-bar-button');
  }
  
  async goto() {
    await this.page.goto('/');
  }

  async openCreateProjectDialog() {
    await this.createProjetctDialogButton.click();
  }

  async fillCreateProjectForm(title: string, description?: string) {
    await this.titleInput.fill(title);
    await this.titleInput.blur();

    if(description) {
      await this.descriptionInput.fill(description);
      await this.descriptionInput.blur();
    }
  }

  async fillEditProjectForm(title: string, description?: string) {
    await this.titleEditInput.fill(title);
    await this.titleEditInput.blur();

    if(description) {
      await this.descriptionEditInput.fill(description);
      await this.descriptionEditInput.blur();
    }
  }

  async fillKeyword(keyword: string) {
    await this.keywordInput.fill(keyword);
    await this.keywordInput.blur();
  }

  async submitCreateProjectForm() {
    await this.createProjectButton.click();
  }

  async dialogIsOpen() {
    await expect(this.dialog).toBeVisible();
  }

  async dialogIsClosed() {
    await expect(this.dialog).not.toBeVisible();
  }

  async getErrorMessage(field: string) {
    return this.page.getByTestId(`${field}-input-messages`);
  }

  async progressCircularIsVisible() {
    await expect(this.progressCircular).toBeVisible();
  }

  async progressCircularIsHidden() {
    await expect(this.progressCircular).not.toBeVisible();
  }

  async openProjectCardMenu(projectId?: string) {
    if(projectId) this.btnProjectCardMenu = this.page.getByTestId(`btn-project-card-menu-${projectId}`);
    
    await this.btnProjectCardMenu.click();
    await expect(this.viewProjectDialogButton).toBeVisible();
    await expect(this.editProjectDialogButton).toBeVisible();
    await expect(this.deleteProjectDialogButton).toBeVisible();
  }

  async openViewProjectDialog() {
    await this.viewProjectDialogButton.click();
  }

  async closeViewProjectDialog() {
    await this.closeViewProjectDialogButton.click();
  }

  async viewProjectDialogIsVisible() {
    await expect(this.viewProjectDialog).toBeVisible();
  }

  async viewProjectDialogIsHidden() {
    await expect(this.viewProjectDialog).not.toBeVisible();
  }

  async openEditProjectDialog() {
    await this.editProjectDialogButton.click();
  }

  async editProjectDialogIsVisible() {
    await expect(this.editProjectDialog).toBeVisible();
  }

  async editProjectDialogIsHidden() {
    await expect(this.editProjectDialog).not.toBeVisible();
  }

  async saveEditedProject() {
    await this.editProjectSaveButton.click();
  }

  async openDeleteProjectDialog() {
    await this.deleteProjectDialogButton.click();
  }

  async deleteProjectDialogIsVisible() {
    await expect(this.deleteProjectDialog).toBeVisible();
  }

  async deleteProjectDialogIsHidden() {
    await expect(this.deleteProjectDialog).not.toBeVisible();
  }

  async confirmDeleteProject() {
    await this.comfirmDeleteProjectButton.click();
  }

  async selectProject(projectId = projectMock._id) {
    const projectCard = this.page.getByTestId(`project-card-${projectId}`);

    await expect(projectCard).toHaveClass(/v-card--variant-flat/);

    await projectCard.hover();
    await projectCard.click();
  }

  async projectIsSelected(projectId = projectMock._id) {
    const projectCard = this.page.getByTestId(`project-card-${projectId}`);
    
    await expect(projectCard).toHaveClass(/v-card--variant-tonal/);
  }

  async openNavBar() {
    await this.navBarButton.click();
  }
}