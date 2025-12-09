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
        <h1 class="text-primaryText text-center text-h3 font-weight-semibold mt-5 mt-sm-0">Registre-se</h1>
        <p class="text-secondaryText text-center mb-10">Crie sua conta para aproveitar nossa plataforma.</p>

        <v-text-field
          name="name"
          placeholder="informe seu nome"
          prepend-inner-icon="mdi-account"
          variant="solo"
          clearable
          icon-color="primary"
          flat
          v-model="name"
          :error-messages="errors.name"
        ></v-text-field>

        <v-text-field
          name="email"
          placeholder="informe seu email"
          prepend-inner-icon="mdi-at"
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

        <v-text-field
          name="confirmPassword"
          :type="viewConfirmPassword ? 'text' : 'password'"
          placeholder="confirme sua senha"
          prepend-inner-icon="mdi-lock"
          :append-inner-icon="viewConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
          variant="solo"
          clearable
          icon-color="primary"
          flat
          @click:append-inner="viewConfirmPassword = !viewConfirmPassword"
          v-model="confirmPassword"
          :error-messages="errors.confirmPassword"
        ></v-text-field>

        <v-btn 
          color="primary" 
          class="mt-2 mx-auto d-block" 
          height="48"
          @click="register"
        >Comfirma</v-btn>

        <v-btn 
          color="primary" 
          class="mt-2 mx-auto d-block" 
          height="48"
          variant="text"
          @click="router.back()"
        >voltar</v-btn>
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
  import registerValidationSchema from '@/utils/validationSchemas/register.validationSchema';
  import { useField, useForm } from 'vee-validate';
  import { useDisplay } from 'vuetify';

  const display = useDisplay()
  const router = useRouter()
  const viewPassword = ref(false);
  const viewConfirmPassword = ref(false)
  const { handleSubmit, errors } = useForm({ validationSchema: registerValidationSchema })
  const { value: name } = useField('name')
  const { value: email } = useField('email')
  const { value: password } = useField('password')
  const { value: confirmPassword } = useField('confirmPassword')

  const register = handleSubmit(async (values) => {
    console.log(values)
  })
</script>