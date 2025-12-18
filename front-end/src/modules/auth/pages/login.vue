<template>
  <v-container fluid class="d-flex pa-0 flex-column-reverse flex-sm-row">
    <v-sheet
      class="d-flex align-sm-center justify-center v-sheet"
      :height="display.xs.value ? '80vh' : '100vh'"
      :width="display.xs.value ? '100%' : '50%'"
      color="background"
    >
      <v-sheet
        color="background"
        width="90%"
        max-width="500"
      >
        <h1 class="text-primaryText text-center text-h3 font-weight-semibold mt-5 mt-sm-0">Elucide Notes</h1>
        <p class="text-secondaryText text-center mb-10">Clareza para suas ideias.</p>

        <v-text-field
          name="email"
          placeholder="informe seu email"
          prepend-inner-icon="mdi-account"
          variant="solo"
          clearable
          icon-color="primary"
          flat
          v-model="email"
          :error-messages="errors.email"
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
          v-model="password"
          :error-messages="errors.password"
        ></v-text-field>

        <v-btn 
          color="primary" 
          class="mt-2 mx-auto d-block" 
          height="48"
          @click="login"
        >Entrar</v-btn>

        <p class="text-center text-secondaryText mt-4">
          Não possui uma conta? 
          <span @click="router.push('/register')" class="text-primary font-weight-bold cursor-pointer">Registre-se.</span>
        </p>

        <p class="text-center text-primary font-weight-bold cursor-pointer mt-4">Esqueci minha senha</p>
      </v-sheet>
    </v-sheet>

    <v-sheet
      class="d-flex align-center justify-center"
      :height="display.xs.value ? '20vh' : '100vh'"
      :width="display.xs.value ? '100%' : '50%'"
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
  import { useDisplay } from 'vuetify';
  import { useField, useForm } from 'vee-validate';
  import loginValidationSchema from '@/utils/validationSchemas/login.validationSchema';

  const display = useDisplay()
  const router = useRouter()
  const viewPassword = ref(false);
  const { handleSubmit, errors } = useForm({ validationSchema: loginValidationSchema });
  const { value: email } = useField('email')
  const { value: password } = useField('password')

  const login = handleSubmit(async (values) => {
    router.push('/')
  })
</script>