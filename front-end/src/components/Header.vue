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
      >Elucide Notes</h1>
    </template>
  </v-app-bar>

  <v-navigation-drawer
    v-model="drawer"
    border="none"
  >
    <p class="font-weight-bold text-subtitle-2 text-secondaryText mt-5 ml-4">Projeto Selecionado</p>
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
        v-for="(menuItem, index) in filteredMenu"
        :key="index"
        :value="menuItem.value"
        :append-icon="menuItem.appendIcon"
        :to="menuItem.route"
        height="56"
        color="primary"
        prepend-gap="15"
        @click="menuItem.onClick && menuItem.onClick()"
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
  import { useAuthStore } from '@/modules/auth/store/auth.store';
  import { useProjectStore } from '@/modules/projects/store/projects.store';

  export interface Menu {
    title: string,
    value: string
    prependIcon?: string
    appendIcon?: string
    route?: string
    requiresProject?: boolean
    onClick?: () => void
  }

  const router = useRouter();
  const projectStore = useProjectStore();
  const authStore = useAuthStore();
  const drawer = ref(false);
  const projectSelected = computed(() => projectStore.projectSelected)

  const menu = ref<Menu[]>([
    {
      title: 'Tarefas',
      value: 'tasks',
      prependIcon: 'mdi-format-list-bulleted-square',
      route: '/tasks',
      requiresProject: true
    },
    {
      title: 'Quadro de Tarefas',
      value: 'taskBoard',
      prependIcon: 'mdi-view-dashboard',
      route: '/task-board',
      requiresProject: true
    },
    {
      title: 'Progresso',
      value: 'progress',
      prependIcon: 'mdi-chart-line',
      // route: '/progress',
      requiresProject: true
    },
    {
      title: 'Configurações',
      value: 'settings',
      prependIcon: 'mdi-cog',
      route: '/settings'
    },
    {
      title: 'Sair',
      value: 'logout',
      prependIcon: 'mdi-logout',
      onClick: async() => {
        await authStore.logout()
        router.push('/login')
      }
    }
  ])
  const filteredMenu = computed(() => {
    return menu.value.filter(item => {
      if (!item.requiresProject) return true
      return !!projectSelected.value
    })
  })

</script>