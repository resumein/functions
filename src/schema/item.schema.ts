import z from "zod";

export const AuthRequestSchema = z.object({
    code: z.string()
});

export type AuthRequest = z.infer<typeof AuthRequestSchema>;