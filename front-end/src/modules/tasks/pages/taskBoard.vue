<template>
  <v-container>
    <PageHeader
      title="Quadro de tarefas"
      subtitle="Gerencie o andamento de suas tarefas"
    ></PageHeader>

    <div class="d-flex justify-center mb-10">
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

    <div>
      <v-sheet
        rounded
        width="400"
      >
        <v-card-title class="text-center">Não Iniciadas</v-card-title>

        <v-card>
          <v-card-title>Tarefa 01</v-card-title>
          
        </v-card>
      </v-sheet>
    </div>
  </v-container>
</template>