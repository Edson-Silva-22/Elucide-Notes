<template>
  <div>
    <v-card
      :ripple="false"
      flat
      :title="title"
    >
      <template v-slot:append>
        <v-btn 
          icon="mdi-delete"
          variant="text"
          @click.stop="deleteDialogIsOpened = !deleteDialogIsOpened"
        ></v-btn>
      </template>
  
      <p 
        class="text-secondaryText font-weight-bold text-body-2 px-4 d-flex flex-wrap mb-5 justify-space-between ga-2"
      >
        <span>TF-{{ code }}</span>
        <span>{{ statusFormatted() }}</span>
        <span>back end</span>
        <span>Criada em 1 set. 2025</span>
      </p>
    </v-card>
  
    <v-dialog
      id="delete-task-dialog"
      v-model="deleteDialogIsOpened"
      max-width="500"
      width="95%"
    >
      <v-card
        color="background"
        title="Realmente deseja excluir esta tarefa?"
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
  
        <p class="px-6 text-secondaryText text-body-1">Ao excluir essa tarefa não será possível recuperá-la.</p>
  
        <div class="px-6 d-flex justify-between ga-2">
          <v-btn
            id="comfirm-delete-project-button"
            color="primary"
            class="mt-5 d-block text-body-1"
            width="150"
            height="56"
            @click="deleteTask"
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
  </div>
</template>

<script setup lang="ts">
import { useProjectStore } from '@/modules/projects/store/projects.store';
import { TaskStatus, useTaskStore, type Task } from '@/modules/tasks/store/tasks.store';

  const props = defineProps<Partial<Task>>()
  const taskStore = useTaskStore()
  const projectStore = useProjectStore()
  const loading = computed(() => taskStore.loading)
  const deleteDialogIsOpened = ref(false)

  function statusFormatted() {
    const status = props.status

    switch (status) {
      case TaskStatus.NOT_STARTED:
        return 'Não Iniciada'
      case TaskStatus.IN_PROGRESS:
        return 'Em progresso'
      case TaskStatus.IN_REVIEW:
        return 'Em revisão'
      case TaskStatus.DONE:
        return 'Concluída'
      default:
        break;
    }
  }

  async function deleteTask() {
    if (!props._id) return
    if (!projectStore.projectSelected?._id) return

    await taskStore.remove(projectStore.projectSelected?._id, props._id)
    deleteDialogIsOpened.value = !deleteDialogIsOpened
  }

</script>