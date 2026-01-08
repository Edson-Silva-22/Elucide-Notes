<template>
  <v-container>
    <PageHeader
      title="Projetos"
      subtitle="Crie um novo projeto ou selecione o projeto que deseja gerenciar"
    ></PageHeader>

    <div class="d-flex justify-center">
      <v-btn
        height="56"
        width="300"
        flat
        class="text-body-1"
        append-icon="mdi-plus"
        color="primary"
        :ripple="false"
        @click="createDialogIsOpened = !createDialogIsOpened"
      >Criar Projeto</v-btn>
    </div>

    <v-text-field
      name="selectProject"
      placeholder="Buscar projeto"
      variant="solo"
      class="my-5 mx-auto"
      prepend-inner-icon="mdi-magnify"
      clearable
      flat
      width="90%"
      max-width="300"
    ></v-text-field>

    <v-item-group mandatory v-if="projects && projects.length > 0">
      <v-row>
        <v-col v-for="item in projects" cols="12" sm="6" md="4">
          <v-item v-slot="{ isSelected, selectedClass, toggle }">
            <v-card
              :title="item.title"
              :color="isSelected || projectStore.projectSelected?.id === item.id ? 'primary' : ''"
              @click="toggle?.call(this); selectProject(item)"
              :variant="isSelected || projectStore.projectSelected?.id === item.id ? 'tonal' : 'flat'"
              v-ripple="false"
              class="py-4"
            >
              <template v-slot:append>
                
                <v-menu
                  location="bottom end"
                >
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon="mdi-dots-vertical"
                      variant="text"
                      @click.stop="console.log('menu')"
                      v-bind="props"
                    ></v-btn>
                  </template>

                  <v-list>
                    <v-list-item
                      title="Editar"
                      @click="editDialogIsOpened = !editDialogIsOpened"
                      prepend-icon="mdi-pencil"
                      prepend-gap="15"
                    ></v-list-item>

                    <v-list-item
                      title="Excluir"
                      @click="deleteDialogIsOpened = !deleteDialogIsOpened"
                      prepend-icon="mdi-delete"
                      prepend-gap="15"
                    ></v-list-item>
                  </v-list>
                </v-menu>
              </template>
            </v-card>
          </v-item>
        </v-col>
      </v-row>
    </v-item-group>

    <p v-else class="text-secondaryText text-center text-body-1 my-10">Nenhum projeto encontrado</p>

    <v-dialog
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
          name="selectProject"
          placeholder="Informe o título do projeto"
          variant="solo"
          class="my-5 px-6"
          clearable
          flat
          v-model="title"
          :error-messages="errors.title"
        ></v-text-field>

        <v-btn
          color="primary"
          class="mt-5 d-block mx-auto text-body-1"
          width="150"
          height="56"
          @click="createProject"
        >Criar</v-btn>
      </v-card>
    </v-dialog>

    <v-dialog
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
          name="selectProject"
          placeholder="Informe o título do projeto"
          variant="solo"
          class="my-5 px-6"
          clearable
          flat
          v-model="title"
          :error-messages="errors.title"
        ></v-text-field>

        <v-btn
          color="primary"
          class="mt-5 d-block mx-auto text-body-1"
          width="150"
          height="56"
          @click="updateProject"
        >Salvar</v-btn>
      </v-card>
    </v-dialog>

    <v-dialog
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
            color="primary"
            class="mt-5 d-block text-body-1"
            width="150"
            height="56"
            @click="deleteDialogIsOpened = !deleteDialogIsOpened"
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
  import { useProjectStore } from '../store/projects.store';
  import { useField, useForm } from 'vee-validate';
  import { toTypedSchema } from "@vee-validate/zod";
  import * as z from 'zod';

  const projectValidationSchema = toTypedSchema(
    z.object({
      title: z
        .string({required_error: 'O título do projeto deve ser informado.', invalid_type_error: 'O título do projeto deve ser informado.'})
        .min(1, {message: 'O título do projeto deve ser informado.'}),
    })
  )

  const router = useRouter();
  const projectStore = useProjectStore()
  const projects = ref()
  const createDialogIsOpened = ref(false)
  const editDialogIsOpened = ref(false)
  const deleteDialogIsOpened = ref(false)
  const { handleSubmit, errors } = useForm({ validationSchema: projectValidationSchema });
  const { value: title } = useField('title')

  function selectProject(project: { id: string, title: string }) {
    localStorage.setItem('projectSelected', JSON.stringify(project))
    projectStore.projectSelected = project
    router.push('/tasks')
  }

  const createProject = handleSubmit(async (values) => {
    createDialogIsOpened.value = !createDialogIsOpened;
  })

  const updateProject = handleSubmit(async (values) => {
    editDialogIsOpened.value = !editDialogIsOpened;
  })
  
  onMounted(() => {
    projects.value = projectStore.projects
  })
</script>