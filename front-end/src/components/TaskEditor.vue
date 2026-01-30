<template>
  <v-dialog
    v-model="model"
    fullscreen
  >
    <v-card
      title="Editor de Tarefas"
      color="background"
      class="pb-4"
      ref="card"
    >
      <template v-slot:append>
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="model = !model"
          v-ripple="false"
        ></v-btn>
      </template>

      
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
          v-model="title"
        ></v-text-field>
      </div>

      <p class="text-secondaryText text-body-2 mt-5 mx-2">Descrição</p>
      <TipTapEditor :editorOptions="descriptionEditorOptions" @editor-update="(v) => editorJson = v"/>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import type { Task } from '@/modules/tasks/store/tasks.store';
  import { type EditorOptions } from '@tiptap/vue-3'
  import type { VCard } from 'vuetify/components';

  const props = defineProps<{
    modelValue: boolean
    task: Task | null
  }>()
  const emit = defineEmits(['update:modelValue'])
  const model = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
  const task = ref({...props.task})
  const title = ref(props.task?.title ?? 'Nova Tarefa')
  const descriptionEditorOptions: Partial<EditorOptions> = {
    content: props.task?.title ?? 'Nenhuma descrição informada',
    autofocus: true,
    onUpdate: ({ editor }) => {
      task.value.description = editor.getJSON()
    }
  }
  const editorJson = ref(null)
  const card = ref<InstanceType<typeof VCard> | null>(null)

  watch(editorJson, async () => {
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
  });
</script>