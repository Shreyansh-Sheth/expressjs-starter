import { z } from "zod";

export const createUserValidator = z.object({
    name: z.string().trim(),
    email: z.string().email()
})

export type createUserValidatorType = z.infer<typeof createUserValidator>