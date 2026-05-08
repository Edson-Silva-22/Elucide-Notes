<template>
  <v-container fluid>
    <PageHeader
      title="Tarefas"
      subtitle="Visualize e gerencie as tarefas do seu projeto"
    ></PageHeader>

    <div class="d-flex justify-center">
      <v-btn
        height="56"
        
        flat
        class="text-body-1"
        color="primary"
        :ripple="false"
        @click="createTaskDialogOpen = true"
        :loading="taskLoading"
      >Criar Tarefa</v-btn>
    </div>

    <v-text-field
      name="selectTask"
      placeholder="Buscar por título ou código"
      variant="solo"
      class="my-5 mx-auto mb-10"
      prepend-inner-icon="mdi-magnify"
      clearable
      flat
      width="90%"
      max-width="300"
      hide-details
    ></v-text-field>

    <v-sheet 
      class="bg-background mx-auto my-10"
      width="100%"
      max-width="700"
    >
      <div class="d-flex flex-wrap justify-center ga-2">
        <v-select
          label=""
          variant="solo"
          clearable
          flat
          hide-details
          min-width="200"
          :items="['Não iniciada', 'Em progresso', 'Em revisão', 'Finalizada']"
          prepend-inner-icon="mdi-filter"
          placeholder="Status"
        ></v-select>
  
        <v-select
          variant="solo"
          clearable
          flat
          hide-details
          min-width="200"
          :items="tags"
          prepend-inner-icon="mdi-tag"
          placeholder="Tags"
          multiple
          item-color="primary"
        >
          <template v-slot:menu-header="{ search, filteredItems }">
            <v-text-field
              v-model="search.value"
              :error="!!search.value && !filteredItems.length"
              density="compact"
              placeholder="Buscar por tag"
              prepend-inner-icon="mdi-magnify"
              variant="solo"
              flat
              clearable
              hide-details
            ></v-text-field>
          </template>

          <template v-slot:item="{ props: itemProps, item }">
            <v-list-item 
              v-bind="itemProps" 
            >
              <template v-slot:prepend="{ isSelected, select }">
                <v-list-item-action start>
                  <v-checkbox-btn :model-value="isSelected" @update:model-value="select"></v-checkbox-btn>
                </v-list-item-action>
              </template>
              
              <template v-slot:append>
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  @click.stop="deleteTagDialogIsOpened = true; deleteTagId = item.raw._id"
                ></v-btn>
              </template>
            </v-list-item>
          </template>

          <template v-slot:no-data>
            <v-list-item>
              <v-list-item-title class="text-secondaryText">Nenhuma tag encontrada</v-list-item-title>  
            </v-list-item>
          </template>

          <template v-slot:menu-footer>
            <v-btn
              flat
              class="ma-auto d-block mb-2"
              icon="mdi-plus"
              color="primary"
              :ripple="false"
              variant="tonal"
              @click="createTagDialogOpen = true"
            ></v-btn>
          </template>
        </v-select>
  
        <v-date-input
          prepend-icon=""
          prepend-inner-icon="mdi-calendar"
          variant="solo"
          clearable
          flat
          hide-details
          min-width="200"
        ></v-date-input>
      </div>
    </v-sheet>

    <v-row v-if="tasks && tasks.length > 0 && !taskLoading">
      <v-col v-for="(task, index) in tasks" cols="12" sm="6" md="4">
        <TaskCard
          :key="index"
          :_id="task._id"
          :code="task.code"
          :title="task.title"
          :status="task.status"
          :description="task.description"
          :tags="task.tags"
          @click="taskSelected = task; taskEditorOpened = true"
        ></TaskCard>
      </v-col>
    </v-row>

    <div v-if="tasks && tasks.length === 0 && taskLoading" class="d-flex justify-center">
      <v-progress-circular
        id="progress-circular"
        color="primary"
        indeterminate
        :size="128"
        :width="10"
      ></v-progress-circular>
    </div>

    <p v-if="tasks && tasks.length === 0 && !taskLoading" class="text-secondaryText text-center text-body-1 my-10">Nenhuma tarefa encontrada</p>

    <TaskEditor
      v-model="taskEditorOpened"
      :task="taskSelected"
      dialogTitle="Editar Tarefa"
    ></TaskEditor>

    <v-dialog
      v-model="createTaskDialogOpen"
    >
      <v-card
        width="100%"
        max-width="500"
        class="bg-background py-2 mx-auto"
      > 
        <div class="d-flex justify-space-between align-center w-100 mb-4">
          <v-card-title primary-title class="px-2">Nova Tarefa</v-card-title>
          
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="createTaskDialogOpen = false"
            v-ripple="false"
          ></v-btn>
        </div>

        <p class="text-secondaryText text-body-2 mx-2">Título</p>
        <v-text-field
          name="title"
          placeholder="Informe o título da tarefa"
          variant="solo"
          clearable
          flat
          class="mx-2"
          v-model="title"
          :error-messages="errors.title"
        ></v-text-field>

        <div>
          <v-btn
            color="primary"
            class="mx-2 mt-10 text-body-1"
            @click="createTask"
            height="56"
            flat
            :loading="taskStore.loading"
          >Criar Tarefa</v-btn>
          <v-btn
            variant="text"
            class="mx-2 mt-10 text-body-1"
            @click="createTaskDialogOpen = false"
            height="56"
            flat
            color="primary"
          >Cancelar</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="createTagDialogOpen"
      max-width="500px"
    >
      <v-card
        class="bg-background py-2"
      >
        <div class="d-flex justify-space-between align-center w-100 mb-4">
          <v-card-title primary-title class="px-2">Nova Tag</v-card-title>
          
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="createTagDialogOpen = false"
            v-ripple="false"
          ></v-btn>
        </div>

        <p class="text-secondaryText text-body-2 mx-2">Título</p>
        <v-text-field
          name="title"
          placeholder="Informe o título da tag"
          variant="solo"
          clearable
          flat
          class="mx-2"
          v-model="tagTitle"
          :error-messages="tagErrors.tagTitle"
        ></v-text-field>

        <div>
          <v-btn
            color="primary"
            class="mx-2 mt-10 text-body-1"
            @click="createTag"
            height="56"
            flat
            :loading="tagLoading"
          >Criar Tag</v-btn>
          <v-btn
            variant="text"
            class="mx-2 mt-10 text-body-1"
            @click="createTagDialogOpen = false"
            height="56"
            flat
            color="primary"
          >Cancelar</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <v-dialog
      id="delete-tag-dialog"
      v-model="deleteTagDialogIsOpened"
      max-width="500"
      width="95%"
    >
      <v-card
        color="background"
        title="Realmente deseja excluir esta tag?"
        class="pb-4"
      >
        <template v-slot:append>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="deleteTagDialogIsOpened = !deleteTagDialogIsOpened"
            v-ripple="false"
          ></v-btn>
        </template>
  
        <p class="px-6 text-secondaryText text-body-1">Ao excluir essa tag não será possível recuperá-la.</p>
  
        <div class="px-6 d-flex justify-between ga-2">
          <v-btn
            id="comfirm-delete-project-button"
            color="primary"
            class="mt-5 d-block text-body-1"
            width="150"
            height="56"
            @click="deleteTag(deleteTagId)"
            :loading="tagLoading"
          >Confirmar</v-btn>
  
          <v-btn
            color="primary"
            variant="text"
            class="mt-5 d-block text-body-1"
            width="150"
            height="56"
            @click="deleteTagDialogIsOpened = !deleteTagDialogIsOpened"
          >Cancelar</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
  import { useProjectStore } from '@/modules/projects/store/projects.store';
  import { useTaskStore, type Task } from '../store/tasks.store';
  import { useField, useForm } from 'vee-validate';
  import { toTypedSchema } from "@vee-validate/zod";
  import * as z from 'zod';
  import { useTagStore } from '@/modules/tags/store/tags.store';

  const createTaskValidationSchema = toTypedSchema(
    z.object({
      title: z.string({required_error: 'O título é obrigatório', invalid_type_error: 'O título é obrigatório'}).min(3, 'O título deve conter no mínimo 3 caracteres'),
    })
  )
  const { handleSubmit, errors } = useForm({ validationSchema: createTaskValidationSchema });
  const { value: title } = useField('title')

  const createTagValidationSchema = toTypedSchema(
    z.object({
      tagTitle: z.string({required_error: 'O título é obrigatório', invalid_type_error: 'O título é obrigatório'}).min(3, 'O título deve conter no mínimo 3 caracteres'),
    })
  )
  const { handleSubmit: handleTagSubmit, errors: tagErrors } = useForm({ validationSchema: createTagValidationSchema });
  const { value: tagTitle } = useField('tagTitle')

  const router = useRouter();
  const projectStore = useProjectStore()
  const taskStore = useTaskStore()
  const tasks = computed(() => taskStore.tasks)
  const tagStore = useTagStore()
  const taskSelected = ref<Task | null>(null)
  const taskEditorOpened = ref(false)
  const createTaskDialogOpen = ref(false)
  const createTagDialogOpen = ref(false)
  const tags = computed(() => tagStore.tags)
  const deleteTagDialogIsOpened = ref(false)
  const taskLoading = computed(() => taskStore.loading)
  const tagLoading = computed(() => tagStore.loading)
  const deleteTagId = ref('')

  const createTask = handleSubmit( async (values) => {
    const response = await taskStore.create(projectStore.projectSelected!._id, {
      title: values.title,
    })

    if (response) createTaskDialogOpen.value = false
    title.value = ''
  })

  async function findAllTasks() {
    await taskStore.findAll(projectStore.projectSelected!._id) 
  }

  const createTag = handleTagSubmit( async (values) => {
    const response = await tagStore.create(projectStore.projectSelected!._id, {
      title: values.tagTitle,
    })

    if (response) createTagDialogOpen.value = false
    tagTitle.value = ''
  })

  async function findAllTags() {
    await tagStore.findAll(projectStore.projectSelected!._id) 
  }

  async function deleteTag(tagId: string) {
    await tagStore.remove(projectStore.projectSelected!._id, tagId)
    deleteTagDialogIsOpened.value = false
  }

  onBeforeMount(() => {
    const projectSelected = projectStore.projectSelected
    if (!projectSelected) {
      router.push('/')
    }
  }) 

  onMounted(async () => {
    await findAllTasks() 
    await findAllTags()
  })
</script>