<template>
  <v-dialog
    v-model="model"
    fullscreen
  >
    <v-card
      color="background"
      class="pb-4"
      ref="card"
    >
      <div class="d-flex justify-space-between align-center w-100 mb-4 py-2">
        <v-card-title primary-title class="px-2">{{ dialogTitle }}</v-card-title>
        
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="model = !model"
          v-ripple="false"
        ></v-btn>
      </div>

      <p class="text-secondaryText text-body-2 mx-2">Título</p>
      <div>
        <v-text-field
          name="title"
          placeholder="Informe o título da tarefa"
          variant="solo"
          clearable
          flat
          max-width="400"
          class="mx-2"
          v-model="task.title"
        ></v-text-field>
      </div>

      <p class="text-secondaryText text-body-2 mt-5 mx-2">Descrição</p>
      <TipTapEditor :key="task?._id" :editorOptions="descriptionEditorOptions"/>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { useProjectStore } from '@/modules/projects/store/projects.store';
  import { TaskStatus, useTaskStore, type Task } from '@/modules/tasks/store/tasks.store';
  import StarterKit from '@tiptap/starter-kit';
  import { type EditorOptions } from '@tiptap/vue-3'
  import type { VCard } from 'vuetify/components';
  import { Collaboration } from '@tiptap/extension-collaboration'
  import { useTaskCollaboration } from '@/utils/useTaskCollaboration';

  const props = defineProps<{
    modelValue: boolean
    task: Task | null
    dialogTitle: string
  }>()
  const emit = defineEmits(['update:modelValue'])

  const model = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const { ydoc, connect, disconnect } = useTaskCollaboration()
  // Use um computed para as opções, garantindo que elas peguem o ydoc.value atualizado
  const descriptionEditorOptions = computed((): Partial<EditorOptions> => ({
    autofocus: true,
    extensions: [
      StarterKit.configure({
        undoRedo: false, // Use false pois o Yjs cuidará do histórico
      }),
      Collaboration.configure({
        document: ydoc.value // Passa a instância atual do ydoc
      }),
    ],
    onUpdate: ({ editor }) => {
      changeCardEditorHeight()
    }
  }))

  const projectStore = useProjectStore()
  const taskStore = useTaskStore()
  const task = ref<Partial<Task>>({
    title: 'Nova Tarefa',
    description: 'Nenhuma descrição informada',
    status: TaskStatus.NOT_STARTED,
    tags: []
  })
  const card = ref<InstanceType<typeof VCard> | null>(null)
  let scrollTimeout: ReturnType<typeof setTimeout> | null = null

  async function changeCardEditorHeight() {
    if (scrollTimeout) clearTimeout(scrollTimeout)

    // O motivo do timeout é para evitar que a função seja chamada repetidamente enquanto o usuário digita, o que pode causar problemas de desempenho.
    scrollTimeout = setTimeout(async () => {
      //Espera o Vue terminar de atualizar o HTML antes de executar o que vem a seguir.
      await nextTick(); // Essencial para o card calcular a nova altura do conteúdo
      
      //Obtém a referência direta ao elemento HTML raiz desse componente.
      const cardElement = card.value?.$el as HTMLElement;
  
      if (cardElement) {
        // Como o scroll está no próprio v-card (conforme seu inspetor):
        cardElement.scrollTo({
          top: cardElement.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100)
  }

  function onBackButton() {
    model.value = false
  }

  watch(model, async (isOpen) => {
    if (isOpen && props.task) {
      // history é um objeto nativo do navegador, parte da Web History API. Ele serve pra controlar o histórico de navegação da página.
      //Adiciona um novo estado sem recarregar a página.
      history.pushState({ dialog: true }, '')
      
      task.value = props.task ? { ...props.task } : {
        title: 'Nova Tarefa',
        description: 'Nenhuma descrição informada',
      }

      await nextTick()
      connect(props.task._id!)
    }

    else {
      disconnect()
    }
  })

  onMounted(() => {
    //Ele dispara quando o usuário aperta voltar ou avançar na página.
    window.addEventListener('popstate', onBackButton)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('popstate', onBackButton)
  })
</script>