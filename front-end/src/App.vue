<template>
  <v-app>
    <alert />
    <router-view />
  </v-app>
</template>

<script lang="ts" setup>
  import { useTheme } from 'vuetify';
  import Alert from './components/alert/alert.vue';

  const theme = useTheme()

  onMounted(() => {
    const themeSelected = localStorage.getItem('themeSelected')
    if (themeSelected) {
      theme.change(themeSelected)
    }
  })
</script>
