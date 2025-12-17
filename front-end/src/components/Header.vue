<template>
  <v-app-bar 
    :elevation="2"
    color="primary"
  >
    <template v-slot:prepend>
      <v-btn 
        icon
        color="secondary"
        @click="drawer = !drawer"
        size=""
        class="pa-2"
      >
        <v-icon icon="mdi-menu"></v-icon>
      </v-btn>

      <h1
        class="text-secondary text-h5 font-weight-bold px-1"
      >{{ projectSelected?.title ?? 'Elucide' }}</h1>
    </template>
  </v-app-bar>

  <v-navigation-drawer
    v-model="drawer"
    border="none"
  >
    <v-btn 
      class="text-none font-weight-bold mb-8 text-body-1"
      variant="text"
      width="100%"
      height="56"
      append-icon="mdi-chevron-down"
      @click="router.push('/')"
    >{{ projectSelected?.title  ?? 'Selecione um projeto' }}</v-btn>

    <v-list
      mandatory
    >
      <v-list-item
        v-for="menuItem in menu"
        :value="menuItem.value"
        :append-icon="menuItem.appendIcon"
        :to="menuItem.route"
        height="56"
        color="primary"
        prepend-gap="15"
      >
        <template v-slot:prepend>
          <v-icon 
            :icon="menuItem.prependIcon" 
            class="font-weight-bold opacity-100"
          ></v-icon>
        </template>

        <v-list-item-title class="font-weight-bold">{{ menuItem.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
  import { useProjectStore } from '@/modules/projects/store/projects.store';

  export interface Menu {
    title: string,
    value: string
    prependIcon?: string
    appendIcon?: string
    route?: string
  }

  const router = useRouter();
  const projectStore = useProjectStore();
  const drawer = ref(false);
  const projectSelected = computed(() => projectStore.projectSelected)

  const menu = ref<Menu[]>([
    {
      title: 'Tarefas',
      value: 'tasks',
      prependIcon: 'mdi-format-list-bulleted-square',
    },
    {
      title: 'Quadro de Tarefas',
      value: 'taskBoard',
      prependIcon: 'mdi-view-dashboard',
    },
    {
      title: 'Progresso',
      value: 'progress',
      prependIcon: 'mdi-chart-line',
    },
    {
      title: 'Configurações',
      value: 'settings',
      prependIcon: 'mdi-cog',
    },
    {
      title: 'Sair',
      value: 'logout',
      prependIcon: 'mdi-logout',
      route: '/login'
    }
  ])
</script>