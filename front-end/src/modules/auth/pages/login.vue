<template>
  <v-container fluid class="d-flex pa-0">
    <v-sheet
      class="d-flex align-center justify-center"
      height="100vh"
      width="50%"
      color="background"
    >
      <v-sheet
        color="background"
        width="90%"
        max-width="500"
      >
        <h1 class="text-primaryText text-center text-h2 font-weight-semibold">Elucide Notes</h1>
        <p class="text-secondaryText text-center mb-10">Clareza para suas ideias.</p>

        <v-text-field
          name="email"
          placeholder="informe seu email"
          prepend-inner-icon="mdi-account"
          variant="solo"
          clearable
          icon-color="primary"
          flat
        ></v-text-field>

        <v-text-field
          name="password"
          :type="viewPassword ? 'text' : 'password'"
          placeholder="informe sua senha"
          prepend-inner-icon="mdi-lock"
          :append-inner-icon="viewPassword ? 'mdi-eye-off' : 'mdi-eye'"
          variant="solo"
          clearable
          icon-color="primary"
          flat
          @click:append-inner="viewPassword = !viewPassword"
        ></v-text-field>

        <v-btn 
          color="primary" 
          class="mt-10 mx-auto d-block" 
          height="48"
        >Entrar</v-btn>

        <p class="text-center text-secondaryText mt-4">
          Não possui uma conta? 
          <span class="text-primary font-weight-bold cursor-pointer">Registre-se.</span>
        </p>

        <p class="text-center text-primary font-weight-bold cursor-pointer mt-4">Esqueci minha senha</p>
      </v-sheet>
    </v-sheet>

    <v-sheet
      class="d-flex align-center justify-center"
      height="100vh"
      width="50%"
      color="secondary"
    >
      <v-img
        src="../../../assets/Task-bro.svg"
        alt="Login Illustration"
        width="80%"
      ></v-img>
    </v-sheet>
  </v-container>
</template>

<script setup lang="ts">
import { vi } from 'vuetify/locale';

  const viewPassword = ref(false);
</script>