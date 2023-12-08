import { z } from "zod";

const environmentSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.string().default("development"),
});

export const ENVIRONMENT = environmentSchema.parse(process.env);
