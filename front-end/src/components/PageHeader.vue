<template>
  <h1 class="d-flex justify-space-between text-primaryText">{{ title }}</h1>
  <p class="text-secondaryText text-body-1 mb-10">{{ subtitle }}</p>
</template>

<script setup lang="ts">
  const props = defineProps<{
    title: string,
    subtitle: string
  }>()
</script>