import { z } from 'zod';

export enum ItemType {
    Project = "project",
    Education = "education",
    Experience = "experience",
    Certification = "certification",
    Award = "award"
}

const ItemFields = {
    id: z.string(),
    username: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date()
};

export const ProjectSchema = z.object({
    ...ItemFields,
    type: z.literal("project"),
    name: z.string(),
    github: z.string(),
    url: z.string().url().optional(),
    description: z.string(),
    fromDate: z.coerce.date(),
    toDate: z.coerce.date().optional(),
    technologiesUsed: z.string().optional()
});

export const EducationSchema = z.object({
    ...ItemFields,
    type: z.literal("education"),
    school: z.string(),
    degree: z.string(),
    field: z.string(),
    fromDate: z.coerce.date(),
    toDate: z.coerce.date().optional(),
    grade: z.string().optional(),
    location: z.string().optional()
});

export const ExperienceSchema = z.object({
    ...ItemFields,
    type: z.literal("experience"),
    title: z.string(),
    company: z.string(),
    fromDate: z.coerce.date(),
    toDate: z.coerce.date().optional(),
    description: z.string().optional(),
    role: z.array(z.string()).default([]),
    location: z.string().optional()
});

export const CertificationSchema = z.object({
    ...ItemFields,
    type: z.literal("certification"),
    title: z.string(),
    platform: z.string(),
    description: z.string().optional(),
    url: z.string().url().optional(),
    completedOn: z.coerce.date().optional(),
    role: z.array(z.string()).default([])
});

export const AwardSchema = z.object({
    ...ItemFields,
    type: z.literal("award"),
    title: z.string(),
    issuer: z.string(),
    awardType: z.string(),
    description: z.string().optional(),
    date: z.coerce.date().optional(),
    role: z.array(z.string()).default([])
});

export const ItemSchema = z.discriminatedUnion("type", [
    ProjectSchema,
    EducationSchema,
    ExperienceSchema,
    CertificationSchema,
    AwardSchema
]);

export type ProjectModel = z.infer<typeof ProjectSchema>;
export type EducationModel = z.infer<typeof EducationSchema>;
export type ExperienceModel = z.infer<typeof ExperienceSchema>;
export type CertificationModel = z.infer<typeof CertificationSchema>;
export type AwardModel = z.infer<typeof AwardSchema>;

export type ItemModel = z.infer<typeof ItemSchema>;