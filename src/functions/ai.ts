import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { AuthenticatedContext, withAuth } from "../middlewares/withAuth";
import { ResumeScanRequestSchema, ResumeRewriteRequestSchema } from "../schema/ai.schema";
import { streamGroqCompletion, scanResumeText } from "../services/ai.service";

export async function resumeScan(request: HttpRequest, context: InvocationContext, auth: AuthenticatedContext): Promise<HttpResponseInit> {
    try {
        const body = ResumeScanRequestSchema.parse(await request.json());
        const textContent = typeof body.resumeContent === 'string' ? body.resumeContent : JSON.stringify(body.resumeContent);
        
        const result = await scanResumeText(textContent);

        return {
            status: 200,
            jsonBody: result
        };
    } catch (err: any) {
        context.error("Error in resumeScan:", err);
        return {
            status: err.status || 400,
            jsonBody: { error: err.message || "Invalid request" }
        };
    }
}

export async function resumeRewrite(request: HttpRequest, context: InvocationContext, auth: AuthenticatedContext): Promise<HttpResponseInit> {
    try {
        const body = ResumeRewriteRequestSchema.parse(await request.json());
        const prompt = `Rewrite the following text:\n${body.text}\n\nInstructions:\n${body.instruction || "Make it more professional"}\n\nTarget Job Description:\n${body.jobDescription || "Not provided"}`;

        const stream = await streamGroqCompletion(prompt);

        return {
            status: 200,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Transfer-Encoding': 'chunked'
            },
            body: stream as any
        };
    } catch (err: any) {
        context.error("Error in resumeRewrite:", err);
        return {
            status: err.status || 400,
            jsonBody: { error: err.message || "Invalid request" }
        };
    }
}

app.http('resumescan', {
    methods: ['POST'],
    route: 'resumescan',
    authLevel: 'anonymous',
    handler: withAuth(resumeScan)
});

app.http('resumerewrite', {
    methods: ['POST'],
    route: 'resumerewrite',
    authLevel: 'anonymous',
    handler: withAuth(resumeRewrite)
});
