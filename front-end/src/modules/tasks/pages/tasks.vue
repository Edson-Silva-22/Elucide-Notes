<template>
  <v-container>
    <PageHeader
      title="Tarefas"
      subtitle="Visualize todas as tarefas do seu projeto ou crie uma nova"
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
      >Criar Tarefa</v-btn>
    </div>

    <v-text-field
      name="selectProject"
      placeholder="Buscar tarefa"
      variant="solo"
      class="my-5 mx-auto"
      prepend-inner-icon="mdi-magnify"
      clearable
      flat
      width="90%"
      max-width="300"
    ></v-text-field>

    <v-row>
      <v-col v-for="value in [1,2,3,4]" cols="12" sm="6" md="4">
        <v-card
          @click="console.log('card')"
          :ripple="false"
          flat
        >
          <v-card-title
            class="d-flex justify-space-between text-primaryText"
          >
            Tarefa 01
            <v-icon icon="mdi-dots-vertical" id="menu-activator" @click.stop="console.log('icon')"></v-icon>

            <v-menu 
              activator="#menu-activator"
              location="bottom end"
            >
              <v-list>
                <v-list-item
                  value="edit"
                  prepend-icon="mdi-pencil"
                  prepend-gap="15"
                  title="Editar"
                  class="text-primaryText"
                ></v-list-item>

                <v-list-item
                  value="edit"
                  prepend-icon="mdi-delete"
                  prepend-gap="15"
                  title="Excluir"
                  class="text-primaryText"
                  
                ></v-list-item>
              </v-list>
            </v-menu>
          </v-card-title>

          <p 
            class="text-secondaryText font-weight-bold text-body-2 px-4 d-flex flex-wrap mb-5 justify-space-between"
          >
            <span>TS-001</span>
            <span>Projeto 01</span>
            <span>Concluída</span>
            <span>Criada em 1 set. 2025</span>
          </p>

          <v-card-text class="text-truncate text-body-1 text-primaryText">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. In molestiae dolor modi, aliquam labore, nulla corrupti inventore debitis atque deleniti optio illum, dolorem at! Soluta totam quidem incidunt molestiae sequi!
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Possimus adipisci illo eos error expedita quis voluptatibus, quod asperiores perspiciatis ipsam minus accusantium quibusdam, vel ipsa dolore? Quisquam ratione molestias quia.
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ex, mollitia illo qui laborum voluptas inventore repudiandae dolor minima odio iusto eum tempora fugiat ipsum, non quisquam, voluptates ducimus totam quaerat.
          </v-card-text>


        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import { useProjectStore } from '@/modules/projects/store/projects.store';

  const router = useRouter();
  const projectStore = useProjectStore()

  onBeforeMount(() => {
    const projectSelected = projectStore.projectSelected
    if (!projectSelected) {
      router.push('/')
    }
  }) 
</script>