import { z } from 'zod';

export const UserSchema = z.object({
    id: z.string(),
    username: z.string(),
    name: z.string(),
    email: z.email(),
    githubToken: z.string()
})

export type UserModel = z.infer<typeof UserSchema>;