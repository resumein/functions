import { z } from 'zod';

export const ResumeScanRequestSchema = z.object({
    resumeContent: z.any(),
    jobDescription: z.string().optional()
});

export type ResumeScanRequest = z.infer<typeof ResumeScanRequestSchema>;

export const ResumeRewriteRequestSchema = z.object({
    text: z.string(),
    instruction: z.string().optional(),
    jobDescription: z.string().optional()
});

export type ResumeRewriteRequest = z.infer<typeof ResumeRewriteRequestSchema>;
