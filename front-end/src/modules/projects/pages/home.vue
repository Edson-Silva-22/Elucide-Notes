<template>
  <v-container>
    <PageHeader
      title="Projetos"
      subtitle="Crie um novo projeto ou selecione o projeto que deseja gerenciar"
    ></PageHeader>

    <div class="d-flex justify-center">
      <v-btn
        height="56"
        width="300"
        flat
        class="text-body-1"
        append-icon="mdi-plus"
        color="primary"
        :ripple="false"
      >Criar Projeto</v-btn>
    </div>

    <v-text-field
      name="selectProject"
      placeholder="Buscar projeto"
      variant="solo"
      class="my-5 mx-auto"
      prepend-inner-icon="mdi-magnify"
      clearable
      flat
      width="90%"
      max-width="300"
    ></v-text-field>

    <v-item-group mandatory>
      <v-row>
        <v-col v-for="item in projects" cols="12" sm="6" md="4">
          <v-item v-slot="{ isSelected, selectedClass, toggle }">
            <v-card
              prepend-icon="mdi-folder-open"
              :title="item.title"
              height="80"
              class="d-flex align-center"
              :color="isSelected || projectStore.projectSelected?.id === item.id ? 'primary' : ''"
              @click="toggle?.call(this); selectProject(item)"
              :variant="isSelected || projectStore.projectSelected?.id === item.id ? 'tonal' : 'flat'"
              v-ripple="false"
            ></v-card>
          </v-item>
        </v-col>
      </v-row>
    </v-item-group>
  </v-container>
</template>

<script setup lang="ts">
  import { useProjectStore } from '../store/projects.store';

  const projectStore = useProjectStore()
  const projects = ref()

  function selectProject(project: { id: string, title: string }) {
    localStorage.setItem('projectSelected', JSON.stringify(project))
    projectStore.projectSelected = project
  }
  
  onMounted(() => {
    projects.value = projectStore.projects
  })
</script>