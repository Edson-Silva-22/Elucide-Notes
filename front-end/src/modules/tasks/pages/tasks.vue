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
        @click="taskSelected = null; dialogTitle = 'Nova Tarefa'; taskEditorOpened = true"
      >Criar Tarefa</v-btn>
    </div>

    <v-text-field
      name="selectProject"
      placeholder="Buscar tarefa"
      variant="solo"
      class="my-5 mx-auto"
      prepend-inner-icon="mdi-magnify"
      clearable
      flat
      width="90%"
      max-width="300"
    ></v-text-field>

    <v-row v-if="tasks && tasks.length > 0">
      <v-col v-for="(task, index) in tasks" cols="12" sm="6" md="4">
        <TaskCard
          :key="index"
          :code="task.code"
          :title="task.title"
          :status="task.status"
          :description="task.description"
          :tags="task.tags"
          @click="taskSelected = task; dialogTitle = 'Editar Tarefa';taskEditorOpened = true"
        ></TaskCard>
      </v-col>
    </v-row>

    <p v-else class="text-secondaryText text-center text-body-1 my-10">Nenhuma tarefa encontrada</p>

    <TaskEditor
      v-model="taskEditorOpened"
      :task="taskSelected"
      :dialogTitle
    ></TaskEditor>
  </v-container>
</template>

<script setup lang="ts">
  import { useProjectStore } from '@/modules/projects/store/projects.store';
  import { useTaskStore, type Task } from '../store/tasks.store';

  const router = useRouter();
  const projectStore = useProjectStore()
  const taskStore = useTaskStore()
  const tasks = ref<Task[]>()
  const taskSelected = ref<Task | null>(null)
  const taskEditorOpened = ref(false)
  const dialogTitle = ref('')

  onBeforeMount(() => {
    const projectSelected = projectStore.projectSelected
    if (!projectSelected) {
      router.push('/')
    }
  }) 

  onMounted(() => {
    tasks.value = taskStore.tasks
  })
</script>