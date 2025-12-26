<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script lang="ts" setup>
  import { useTheme } from 'vuetify';

  const theme = useTheme()

  onMounted(() => {
    const themeSelected = localStorage.getItem('themeSelected')
    if (themeSelected) {
      theme.change(themeSelected)
    }
  })
</script>
