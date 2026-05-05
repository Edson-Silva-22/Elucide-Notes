<template>
  <v-container fluid>
    <PageHeader
      title="Tarefas"
      subtitle="Visualize e gerencie as tarefas do seu projeto"
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
        @click="createTaskDialogOpen = true"
      >Criar Tarefa</v-btn>
    </div>

    <v-text-field
      name="selectProject"
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
          :items="['Tag 01', 'Tag 02', 'Tag 03', 'Tag 04', 'Tag 05', 'Tag 06', 'Tag 07', 'Tag 08', 'Tag 09', 'Tag 10']"
          prepend-inner-icon="mdi-tag"
          placeholder="Tags"
          multiple
        >
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

    <v-row v-if="tasks && tasks.length > 0">
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

    <p v-else class="text-secondaryText text-center text-body-1 my-10">Nenhuma tarefa encontrada</p>

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
            :loading="taskStore.loading"
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
  </v-container>
</template>

<script setup lang="ts">
  import { useProjectStore } from '@/modules/projects/store/projects.store';
  import { useTaskStore, type Task } from '../store/tasks.store';
  import { useField, useForm } from 'vee-validate';
  import { toTypedSchema } from "@vee-validate/zod";
  import * as z from 'zod';

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
  const taskSelected = ref<Task | null>(null)
  const taskEditorOpened = ref(false)
  const createTaskDialogOpen = ref(false)
  const createTagDialogOpen = ref(false)

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
    console.log('Criar tag com título:', values.tagTitle)
    // const response = await taskStore.createTag(projectStore.projectSelected!._id, {
    //   title: values.tagTitle,
    // })

    // if (response) createTagDialogOpen.value = false
    // tagTitle.value = ''
  })

  onBeforeMount(() => {
    const projectSelected = projectStore.projectSelected
    if (!projectSelected) {
      router.push('/')
    }
  }) 

  onMounted(async () => {
    await findAllTasks() 
  })
</script>