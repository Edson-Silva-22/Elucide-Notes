<template>
  <v-container>
    <PageHeader
      title="Projetos"
      subtitle="Crie um novo projeto ou selecione o projeto que deseja gerenciar"
    ></PageHeader>

    <div class="d-flex justify-center">
      <v-btn
        id="create-project-dialog-button"
        height="56"
        flat
        class="text-body-1"
        color="primary"
        :ripple="false"
        @click="createDialogIsOpened = !createDialogIsOpened"
      >Criar Projeto</v-btn>
    </div>

    <v-text-field
      id="keyword-input"
      name="selectProject"
      placeholder="Buscar projeto"
      variant="solo"
      class="my-5 mx-auto"
      prepend-inner-icon="mdi-magnify"
      clearable
      flat
      width="90%"
      max-width="300"
      v-model="keyword"
      @update:model-value="findAll"
    ></v-text-field>

    <div v-if="projects && projects.length === 0 && loading" class="d-flex justify-center">
      <v-progress-circular
        id="progress-circular"
        color="primary"
        indeterminate
        :size="128"
        :width="10"
      ></v-progress-circular>
    </div>

    <v-item-group mandatory v-if="projects && projects.length > 0">
      <v-row>
        <v-col v-for="item in projects" cols="12" sm="6" md="4">
          <v-item v-slot="{ isSelected, toggle }">
            <v-card
              :id="`project-card-${item._id}`"
              :title="item.title"
              :color="isSelected || projectStore.projectSelected?._id === item._id ? 'primary' : ''"
              @click="toggle?.call(this); selectProject(item)"
              :variant="isSelected || projectStore.projectSelected?._id === item._id ? 'tonal' : 'flat'"
              v-ripple="false"
              class="py-4"
            >
              <template v-slot:append>
                <v-menu
                  location="bottom end"
                >
                  <template v-slot:activator="{ props }">
                    <v-btn
                      :id="`btn-project-card-menu-${item._id}`"
                      icon="mdi-dots-vertical"
                      variant="text"
                      v-bind="props"
                    ></v-btn>
                  </template>

                  <v-list>
                    <v-list-item
                      id="view-project-dialog-button"
                      title="Detalhar"
                      @click="viewDialog(item)"
                      prepend-icon="mdi-eye"
                      prepend-gap="15"
                    ></v-list-item>

                    <v-list-item
                      id="edit-project-dialog-button"
                      title="Editar"
                      @click="editDialog(item)"
                      prepend-icon="mdi-pencil"
                      prepend-gap="15"
                    ></v-list-item>

                    <v-list-item
                      id="delete-project-dialog-button"
                      title="Excluir"
                      @click="deleteDialog(item)"
                      prepend-icon="mdi-delete"
                      prepend-gap="15"
                    ></v-list-item>
                  </v-list>
                </v-menu>
              </template>

              <v-card-text class="text-truncate">{{ item.description ? item.description : 'Sem descrição'}}</v-card-text>
            </v-card>
          </v-item>
        </v-col>
      </v-row>
    </v-item-group>

    <p v-if="projects && projects.length === 0 && !loading" class="text-secondaryText text-center text-body-1 my-10">Nenhum projeto encontrado</p>

    <v-dialog
      id="create-project-dialog"
      v-model="createDialogIsOpened"
      max-width="500"
      width="95%"
    >
      <v-card
        color="background"
        title="Criar Projeto"
        class="pb-4"
      >
        <template v-slot:append>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="createDialogIsOpened = !createDialogIsOpened"
            v-ripple="false"
          ></v-btn>
        </template>

        <v-text-field
          id="title-input"
          name="title"
          placeholder="Informe o título do projeto"
          variant="solo"
          class="my-5 px-6"
          clearable
          flat
          v-model="title"
          :error-messages="errorsCreate.title"
        ></v-text-field>

        <v-textarea
          id="description-input"
          name="description"
          placeholder="Informe uma descrição para o projeto"
          variant="solo"
          class="my-5 px-6"
          clearable
          flat
          v-model="description"
          :error-messages="errorsCreate.description"
          @click:clear="description = undefined"
        ></v-textarea>

        <v-btn
          id="create-project-button"
          color="primary"
          class="mt-5 d-block mx-auto text-body-1"
          width="150"
          height="56"
          @click="createProject"
          :loading
        >Criar</v-btn>
      </v-card>
    </v-dialog>

    <v-dialog
      id="view-project-dialog"
      v-model="viewDialogIsOpened"
      max-width="500"
      width="95%"
    >
      <v-card
        color="background"
        :title="projectForView?.title"
        class="pb-4"
      >
        <template v-slot:append>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="viewDialogIsOpened = !viewDialogIsOpened"
            v-ripple="false"
          ></v-btn>
        </template>

        <p
          class="text-secondaryText font-weight-bold text-body-2 px-6 d-flex flex-wrap mb-5 justify-space-between ga-2"
        >
          {{ projectForView?.createdAt ? `Criado em ${new Date(projectForView.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}` : '' }}
        </p>

        <v-card-text>{{ projectForView?.description ? projectForView.description : 'Sem descrição'}}</v-card-text>

        <v-btn
          id="close-view-project-dialog-button"
          color="primary"
          class="mt-5 d-block mx-auto text-body-1"
          width="150"
          height="56"
          @click="viewDialogIsOpened = !viewDialogIsOpened"
        >Fechar</v-btn>
      </v-card>
    </v-dialog>

    <v-dialog
      id="edit-project-dialog"
      v-model="editDialogIsOpened"
      max-width="500"
      width="95%"
    >
      <v-card
        color="background"
        title="Editar Projeto"
        class="pb-4"
      >
        <template v-slot:append>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="editDialogIsOpened = !editDialogIsOpened"
            v-ripple="false"
          ></v-btn>
        </template>

        <v-text-field
          id="title-edit-input"
          name="updatedTitle"
          placeholder="Informe o título do projeto"
          variant="solo"
          class="my-5 px-6"
          clearable
          flat
          v-model="updatedTitle"
          :error-messages="errorsUpdate.updatedTitle"
        ></v-text-field>

        <v-textarea
          id="description-edit-input"
          name="description"
          placeholder="Informe uma descrição para o projeto"
          variant="solo"
          class="my-5 px-6"
          clearable
          flat
          v-model="updatedDescription"
          :error-messages="errorsUpdate.updatedDescription"
          @click:clear="updatedDescription = undefined"
        ></v-textarea>

        <v-btn
          id="edit-project-save-button"
          color="primary"
          class="mt-5 d-block mx-auto text-body-1"
          width="150"
          height="56"
          @click="updateProject"
          :loading
        >Salvar</v-btn>
      </v-card>
    </v-dialog>

    <v-dialog
      id="delete-project-dialog"
      v-model="deleteDialogIsOpened"
      max-width="500"
      width="95%"
    >
      <v-card
        color="background"
        title="Realmente deseja excluir este projeto?"
        class="pb-4"
      >
        <template v-slot:append>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="deleteDialogIsOpened = !deleteDialogIsOpened"
            v-ripple="false"
          ></v-btn>
        </template>

        <p class="px-6 text-secondaryText text-body-1">Ao excluir esse projeto todas tarefas relaionadas a ele também serão excluidas.</p>

        <div class="px-6 d-flex justify-between ga-2">
          <v-btn
            id="comfirm-delete-project-button"
            color="primary"
            class="mt-5 d-block text-body-1"
            width="150"
            height="56"
            @click="deleteProject(projectSelectedId)"
            :loading
          >Confirmar</v-btn>
  
          <v-btn
            color="primary"
            variant="text"
            class="mt-5 d-block text-body-1"
            width="150"
            height="56"
            @click="deleteDialogIsOpened = !deleteDialogIsOpened"
          >Cancelar</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
  import { useProjectStore, type Project } from '../store/projects.store';
  import { useField, useForm } from 'vee-validate';
  import { toTypedSchema } from "@vee-validate/zod";
  import * as z from 'zod';

  const projectValidationSchema = toTypedSchema(
    z.object({
      title: z
        .string({required_error: 'O título do projeto deve ser informado.', invalid_type_error: 'O título do projeto deve ser informado.'})
        .min(1, {message: 'O título do projeto deve ser informado.'}),
      description: z
        .string()
        .optional()
    })
  )

  const updateProjectValidationSchema = toTypedSchema(
    z.object({
      updatedTitle: z
        .string({required_error: 'O título do projeto deve ser informado.', invalid_type_error: 'O título do projeto deve ser informado.'})
        .min(1, {message: 'O título do projeto deve ser informado.'}),
      updatedDescription: z
        .string()
        .optional()
    })
  )

  const router = useRouter();
  const projectStore = useProjectStore()
  const projects = computed(() => projectStore.projects)
  const createDialogIsOpened = ref(false)
  const viewDialogIsOpened = ref(false)
  const editDialogIsOpened = ref(false)
  const deleteDialogIsOpened = ref(false)
  const { handleSubmit: handleSubmitCreate, errors: errorsCreate } = useForm({ validationSchema: projectValidationSchema });
  const { value: title } = useField('title')
  const { value: description } = useField('description')
  const { handleSubmit: handleSubmitUpdate, errors: errorsUpdate } = useForm({ validationSchema: updateProjectValidationSchema });
  const { value: updatedTitle } = useField('updatedTitle')
  const { value: updatedDescription } = useField('updatedDescription')
  const projectSelectedId = ref<string>('')
  const projectForView = ref<Project>()
  const keyword = ref('')
  const loading = computed(() => projectStore.loading)

  function selectProject(project: { _id: string, title: string }) {
    localStorage.setItem('projectSelected', JSON.stringify(project))
    projectStore.projectSelected = project
    router.push('/tasks')
  }

  function viewDialog(project: Project) {
    viewDialogIsOpened.value = !viewDialogIsOpened.value; 
    projectForView.value = project
  }

  function editDialog(item: Project) {
    editDialogIsOpened.value = !editDialogIsOpened.value; 
    updatedTitle.value = item.title; 
    updatedDescription.value = item.description;
    projectSelectedId.value = item._id
  }

  function deleteDialog(item: Project) {
    deleteDialogIsOpened.value = !deleteDialogIsOpened.value; 
    projectSelectedId.value = item._id
  }

  const createProject = handleSubmitCreate(async (values) => {
    const response = await projectStore.create(values)

    if (response) {
      createDialogIsOpened.value = !createDialogIsOpened;
      title.value = undefined
      description.value = undefined
    }
  })

  const updateProject = handleSubmitUpdate(async (values) => {
    await projectStore.update(
      projectSelectedId.value, 
      { 
        title: values.updatedTitle,
        description: values.updatedDescription
      }
    )
    editDialogIsOpened.value = !editDialogIsOpened;
  })

  async function findAll() {
    await projectStore.findAll({ keyword: keyword.value })
  }

  async function deleteProject(projectId: string) {
    await projectStore.deleteProject(projectId)
    deleteDialogIsOpened.value = !deleteDialogIsOpened
  }
  
  onMounted(async () => {
    await findAll()
  })
</script>