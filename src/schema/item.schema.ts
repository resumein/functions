import { z } from 'zod';

export const CreateProjectSchema = z.object({
    type: z.literal("project"),
    name: z.string(),
    github: z.string(),
    url: z.string().url().optional(),
    description: z.string(),
    fromDate: z.coerce.date(),
    toDate: z.coerce.date().optional()
});

export const CreateEducationSchema = z.object({
    type: z.literal("education"),
    school: z.string(),
    degree: z.string(),
    field: z.string(),
    fromDate: z.coerce.date(),
    toDate: z.coerce.date().optional(),
    grade: z.string().optional()
});

export const CreateExperienceSchema = z.object({
    type: z.literal("experience"),
    title: z.string(),
    company: z.string(),
    fromDate: z.coerce.date(),
    toDate: z.coerce.date().optional(),
    description: z.string().optional(),
    role: z.array(z.string()).default([])
});

export const CreateCertificationSchema = z.object({
    type: z.literal("certification"),
    title: z.string(),
    platform: z.string(),
    description: z.string().optional(),
    url: z.string().url().optional(),
    completedOn: z.coerce.date().optional(),
    role: z.array(z.string()).default([])
});

export const CreateAwardSchema = z.object({
    type: z.literal("award"),
    title: z.string(),
    issuer: z.string(),
    awardType: z.string(),
    description: z.string().optional(),
    date: z.coerce.date().optional(),
    role: z.array(z.string()).default([])
});

export const CreateItemSchema = z.discriminatedUnion("type", [
    CreateProjectSchema,
    CreateEducationSchema,
    CreateExperienceSchema,
    CreateCertificationSchema,
    CreateAwardSchema
]);

export const DeleteItemSchema = z.object({
    id: z.string()
});

export type CreateProjectRequest = z.infer<typeof CreateProjectSchema>;
export type CreateEducationRequest = z.infer<typeof CreateEducationSchema>;
export type CreateExperienceRequest = z.infer<typeof CreateExperienceSchema>;
export type CreateCertificationRequest = z.infer<typeof CreateCertificationSchema>;
export type CreateAwardRequest = z.infer<typeof CreateAwardSchema>;

export type CreateItemRequest = z.infer<typeof CreateItemSchema>;

export type DeleteItemRequest = z.infer<typeof DeleteItemSchema>;