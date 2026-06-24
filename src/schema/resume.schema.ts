import z from "zod";

export const CreateResumeSchema = z.object({
    filename: z.string(),
    template: z.string(),
    content: z.json(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date()
});