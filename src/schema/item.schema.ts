import { z } from 'zod';

const CreateProjectSchema = z.object({
    type: z.literal("project"),
    name: z.string(),
    github: z.string().nullish(),
    url: z.string().nullish(),
    description: z.string(),
    fromDate: z.coerce.date(),
    toDate: z.coerce.date().nullish(),
    technologiesUsed: z.string().nullish()
});

const CreateEducationSchema = z.object({
    type: z.literal("education"),
    school: z.string(),
    degree: z.string(),
    field: z.string(),
    fromDate: z.coerce.date(),
    toDate: z.coerce.date().nullish(),
    grade: z.string().nullish(),
    location: z.string().nullish()
});

const CreateExperienceSchema = z.object({
    type: z.literal("experience"),
    title: z.string(),
    company: z.string(),
    fromDate: z.coerce.date(),
    toDate: z.coerce.date().nullish(),
    description: z.string().nullish(),
    role: z.array(z.string()).default([]),
    location: z.string().nullish()
});

const CreateCertificationSchema = z.object({
    type: z.literal("certification"),
    title: z.string(),
    platform: z.string(),
    description: z.string().nullish(),
    url: z.string().nullish(),
    completedOn: z.coerce.date().nullish(),
    role: z.array(z.string()).default([])
});

const CreateAwardSchema = z.object({
    type: z.literal("award"),
    title: z.string(),
    issuer: z.string(),
    awardType: z.string(),
    description: z.string().nullish(),
    date: z.coerce.date().nullish(),
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

export type CreateItemRequest = z.infer<typeof CreateItemSchema>;

export type DeleteItemRequest = z.infer<typeof DeleteItemSchema>;