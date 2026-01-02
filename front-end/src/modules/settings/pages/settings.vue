<template>
  <v-container fluid>
    <PageHeader
      title="Configurações"
      subtitle="Configurações do sistema"
    ></PageHeader>

    <div>
      <v-card-title class="pa-0">Tema</v-card-title>

      <v-btn-toggle
        v-model="toggle"
        mandatory
        color="primary"
      >
        <v-btn 
          v-for="theme in themes"
          :prepend-icon="theme.prependIcon"
          :ripple="false"
          class="text-body-1"
          variant="tonal"
          :value="theme.value"
          @click="toggleTheme"
        >{{ theme.title }}</v-btn>
      </v-btn-toggle>
    </div>
  </v-container>
</template>

<script setup lang="ts">
  import { useTheme } from 'vuetify';

  const theme = useTheme()
  const toggle = ref()
  const themes = ref([
    {
      title: 'Claro',
      value: 'light',
      prependIcon: 'mdi-white-balance-sunny'
    },
    {
      title: 'Escuro',
      value: 'dark',
      prependIcon: 'mdi-moon-waning-crescent'
    },
    {
      title: 'Sistema',
      value: 'system',
      prependIcon: 'mdi-desktop-tower-monitor'
    }
  ])

  function toggleTheme() {
    localStorage.setItem('themeSelected', toggle.value)
    theme.change(toggle.value)
  }

  onMounted(() => {
    toggle.value = localStorage.getItem('themeSelected') ?? 'system'
  })
</script>