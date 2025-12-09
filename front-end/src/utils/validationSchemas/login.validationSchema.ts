import { toTypedSchema } from "@vee-validate/zod";
import * as z from 'zod';

const loginValidationSchema = toTypedSchema(
  z.object({
    email: z
      .email({error: 'Um email válido deve ser informado.'})
      .min(1, {error: 'Um email válido deve ser informado.'}),
    password: z
      .string({error: 'A senha deve ser informada.'})
      .min(1, {error: 'A senha deve ser informada.'}),
  })
)

export default loginValidationSchema