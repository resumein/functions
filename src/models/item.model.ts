import { z } from 'zod';

export const ProjectSchema = z.object({
    id: z.string(),
    type: z.literal("project"),
    username: z.string(),
    name: z.string(),
    github: z.string(),
    url: z.string().url().optional(),
    description: z.string(),
    fromDate: z.date(),
    toDate: z.date().optional(),
    createdAt: z.date(),
    updatedAt: z.date()
});

export const EducationSchema = z.object({
    id: z.string(),
    type: z.literal("education"),
    username: z.string(),
    school: z.string(),
    degree: z.string(),
    field: z.string(),
    fromDate: z.date(),
    toDate: z.date().optional(),
    grade: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date()
});

export enum ItemType {
    Project = "project",
    Education = "education"
}

export type ProjectModel = z.infer<typeof ProjectSchema>;
export type EducationModel = z.infer<typeof EducationSchema>;

export type ItemModel = ProjectModel | EducationModel;