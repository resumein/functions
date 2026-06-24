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

export const ProjectSchema = CreateProjectSchema.extend({
    id: z.string(),
    username: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date()
});

export const EducationSchema = CreateEducationSchema.extend({
    id: z.string(),
    username: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date()
});

export const ExperienceSchema = CreateExperienceSchema.extend({
    id: z.string(),
    username: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date()
});

export const CertificationSchema = CreateCertificationSchema.extend({
    id: z.string(),
    username: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date()
});

export const AwardSchema = CreateAwardSchema.extend({
    id: z.string(),
    username: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date()
});

export enum ItemType {
    Project = "project",
    Education = "education",
    Experience = "experience",
    Certification = "certification",
    Award = "award"
}

export const CreateItemSchema = z.discriminatedUnion("type", [
    CreateProjectSchema,
    CreateEducationSchema,
    CreateExperienceSchema,
    CreateCertificationSchema,
    CreateAwardSchema
]);

export const ItemSchema = z.discriminatedUnion("type", [
    ProjectSchema,
    EducationSchema,
    ExperienceSchema,
    CertificationSchema,
    AwardSchema
]);

export type CreateProjectModel = z.infer<typeof CreateProjectSchema>;
export type CreateEducationModel = z.infer<typeof CreateEducationSchema>;
export type CreateExperienceModel = z.infer<typeof CreateExperienceSchema>;
export type CreateCertificationModel = z.infer<typeof CreateCertificationSchema>;
export type CreateAwardModel = z.infer<typeof CreateAwardSchema>;

export type CreateItemModel = z.infer<typeof CreateItemSchema>;

export type ProjectModel = z.infer<typeof ProjectSchema>;
export type EducationModel = z.infer<typeof EducationSchema>;
export type ExperienceModel = z.infer<typeof ExperienceSchema>;
export type CertificationModel = z.infer<typeof CertificationSchema>;
export type AwardModel = z.infer<typeof AwardSchema>;

export type ItemModel = z.infer<typeof ItemSchema>;