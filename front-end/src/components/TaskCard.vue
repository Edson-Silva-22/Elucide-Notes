<template>
  <v-card
    @click="console.log('card')"
    :ripple="false"
    flat
  >
    <v-card-title
      class="text-primaryText text-truncate"
    >
      {{ title }}
    </v-card-title>

    <p 
      class="text-secondaryText font-weight-bold text-body-2 px-4 d-flex flex-wrap mb-5 justify-space-between"
    >
      <span>{{ code }}</span>
      <span>Projeto 01</span>
      <span>{{ statusFormatted() }}</span>
      <span>Criada em 1 set. 2025</span>
    </p>

    <v-card-text class="text-truncate text-body-1 text-primaryText">{{ description }}</v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { TaskStatus } from '@/modules/tasks/store/tasks.store';

  const props = defineProps<{
    code: string
    title: string
    status: string
    description: string
    tags: {
      id: string
      name: string
    }[]
  }>()

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

</script>