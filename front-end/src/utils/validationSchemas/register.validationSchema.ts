import { toTypedSchema } from "@vee-validate/zod";
import * as z from 'zod';

const registerValidationSchema = toTypedSchema(
  z.object({
    name: z
      .string({error: 'O nome de ser informao.'})
      .min(1, {error: 'O nome de ser informao.'}),
    email: z
      .email({error: 'Um email válido deve ser informado.'})
      .min(1, {error: 'Um email válido deve ser informado.'}),
    password: z
      .string({error: 'A senha deve ser informada.'})
      .min(1, {error: 'A senha deve ser informada.'}),
    confirmPassword: z
      .string({error: 'A senha deve ser confirmada'})
      .min(1, {error: 'A senha deve ser confirmada'})
  })
  .refine((value) => value.password === value.confirmPassword, {
    error: 'As senhas devem ser iguais',
    path: ['confirmPassword']
  }),
)

export default registerValidationSchema