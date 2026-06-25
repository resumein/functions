import { z } from 'zod';

export const ResumeSchema = z.object({
    id: z.string(),
    username: z.string(),
    type: z.literal("resume"),
    filename: z.string(),
    template: z.string(),
    content: z.json(),
    jobDescription: z.string().optional().nullable(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date()
});

export type ResumeModel = z.infer<typeof ResumeSchema>;
