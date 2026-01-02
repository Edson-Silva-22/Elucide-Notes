<template>
  <v-container fluid class="position-relative">
    <PageHeader
      title="Quadro de tarefas"
      subtitle="Gerencie o andamento de suas tarefas"
    ></PageHeader>

    <div class="d-flex justify-center mb-10">
      <v-btn
        height="56"
        width="300"
        flat
        class="text-body-1"
        append-icon="mdi-plus"
        color="primary"
        :ripple="false"
      >Criar Tarefa</v-btn>
    </div>
       
    <div class="d-flex ga-2 justify-space-between" v-if="display.mdAndUp.value">
      <div v-for="(stage, index) in groupedTasks">
        <v-card 
          class="d-flex justify-center align-center mb-2 pa-0 position-sticky bg-background" 
          color="background"
          :title="stage.title"
          style="z-index: 1000; top: 64px;"
          elevation="0"
          rounded="0"
        ></v-card>

        <v-card
          :key="index"
          width="400"
          variant="text"
          color="secondaryText"
        >
          <div>
            <draggable
              v-if="stage.items.length > 0"
              v-model="stage.items"
              group="products"
              item-key="id"
              @change="onDropCard($event, stage.status)"
            >
              <template #item="{ element }">
                <div class="mb-2">
                  <TaskCard
                    :code="element.code"
                    :title="element.title"
                    :status="element.status"
                    :description="element.description"
                    :tags="element.tags"
                  ></TaskCard>
                </div>
              </template>
            </draggable>

            <p
              v-else
              class="text-secondaryText text-center text-body-1"
            >Nenhuma tarefa encontrada</p>
          </div>
        </v-card>
      </div>
    </div>

    <div v-else>
      <v-btn
      icon="mdi-chevron-left"
      color="primary"
      class="position-fixed bottom-0 mr-2 mb-2"
      style="z-index: 3000;"
      @click="stageSelected -= 1"
      v-if="stageSelected !== 0"
      ></v-btn>
      
      <v-btn
      icon="mdi-chevron-right"
      color="primary"
      class="position-fixed bottom-0 right-0 mr-2 mb-2"
      style="z-index: 3000;"
      @click="stageSelected += 1"
      v-if="stageSelected !== groupedTasks.length - 1"
      ></v-btn>

      <v-card 
        class="d-flex justify-center align-center mb-2 pa-0 position-sticky bg-background" 
        color="background"
        :title="stages[stageSelected]?.title"
        style="z-index: 1000; top: 64px;"
        elevation="0"
        rounded="0"
      ></v-card>

      <v-window v-model="stageSelected">
        <v-window-item
          v-for="(stage, index) in groupedTasks"
          :key="index"
        >
          <v-card
            :key="index"
            max-width="700"
            class="mx-auto"
            variant="text"
            color="secondaryText"
          >
            <div
              v-if="stage.items.length > 0"
              v-for="(task) in stage.items"
              :key="task.id"
              class="mb-2"
            >
              <TaskCard
                :code="task.code"
                :title="task.title"
                :status="task.status"
                :description="task.description"
                :tags="task.tags"
              ></TaskCard>
            </div>

            <p v-else class="text-secondaryText text-center text-body-1 my-10">Nenhuma tarefa encontrada</p>
          </v-card>
        </v-window-item>
      </v-window>
    </div>
  </v-container>
</template>

<script setup lang="ts">
  import { useDisplay } from 'vuetify';
  import { useTaskStore, type Task } from '../store/tasks.store';
  import draggable from 'vuedraggable'

  const display = useDisplay()
  const taskStore = useTaskStore()
  const tasks = ref<Task[]>([])
  const stages = [
    { title: 'Não Iniciadas', status: 'not started' },
    { title: 'Em Produção', status: 'in progress' },
    { title: 'Em Revisão', status: 'in review' },
    { title: 'Finalizado', status: 'done' }
  ]
  const groupedTasks = computed(() =>
    stages.map(stage => ({
      ...stage,
      items: tasks.value!.filter(t => t.status === stage.status)
    }))
  )
  const stageSelected = ref(0)

  async function onDropCard(event: any, targetStatus: string) {
    // Movimentação entre as colunas de status
    if (event && event.added && event.added.element) {
      const elementMoved = event.added.element
      // await productsStore.updateProduct(elementMoved._id, { status: targetStatus })
    }

    // Reordenação dentro da mesma coluna
    if (event && event.moved && event.moved.element) {
      const elementMoved = event.moved.element
      const prevElement = tasks.value![event.moved.newIndex - 1]
      const nextElement = tasks.value![event.moved.newIndex + 1]

      // await productsStore.updateProduct(elementMoved._id, { order: 
      //   prevElement && nextElement
      //     ? (prevElement.order + nextElement.order) / 2
      //     : prevElement
      //       ? prevElement.order + 1
      //       : nextElement
      //         ? nextElement.order - 1
      //         : 0
      // })
    }
  }
  onMounted(() => {
    tasks.value = taskStore.tasks
  })
</script>