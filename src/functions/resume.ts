import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { AuthenticatedContext, withAuth } from "../middlewares/withAuth";
import { createResume, deleteResume, getResumesByUsername, updateResume } from "../repositories/resume.repo";
import { CreateResumeSchema } from "../schema/resume.schema";
import { ResumeModel, ResumeSchema } from "../models/resume.model";

export async function resume(request: HttpRequest, context: InvocationContext, auth: AuthenticatedContext): Promise<HttpResponseInit> {

    const username = auth.user.username;

    switch (request.method) {
        case 'GET':
            const resumes = await getResumesByUsername(username);

            return {
                status: 200,
                jsonBody: resumes.map(resume => ResumeSchema.parse(resume))
            };

        case 'POST':
            const postBody = CreateResumeSchema.parse(await request.json());

            const newResume: ResumeModel = {
                ...postBody,
                id: crypto.randomUUID(),
                username,
                type: "resume",
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const { resource } = await createResume(newResume);

            if (!resource) {
                return {
                    status: 500,
                    jsonBody: { error: "Failed to create resume" }
                };
            }

            return {
                status: 201,
                jsonBody: resource
            };

        case 'PUT':
            const resumeIdToUpdate = request.params.id;

            if (!resumeIdToUpdate) {
                return {
                    status: 400,
                    jsonBody: { error: "Missing resume ID" }
                };
            }

            const putBody = CreateResumeSchema.parse(await request.json());

            const updatedResume: ResumeModel = {
                ...putBody,
                id: resumeIdToUpdate,
                username,
                type: "resume",
                updatedAt: new Date()
            };

            try {
                const { resource } = await updateResume(updatedResume);

                return {
                    status: 200,
                    jsonBody: resource
                };
            } catch (error) {
                if (error.code === 404) {
                    return {
                        status: 404,
                        jsonBody: { error: "Resume not found" }
                    };
                } else {
                    return {
                        status: 500,
                        jsonBody: { error: "Failed to update resume" }
                    };
                }
            }

        case 'DELETE':
            const resumeIdToDelete = request.params.id;
            if (!resumeIdToDelete) {
                return {
                    status: 400,
                    jsonBody: { error: "Missing resume ID" }
                };
            }

            try {
                await deleteResume(resumeIdToDelete, username);
                return {
                    status: 204
                };
            } catch (error) {
                if (error.code === 404) {
                    return {
                        status: 404,
                        jsonBody: { error: "Resume not found" }
                    };
                } else {
                    return {
                        status: 500,
                        jsonBody: { error: "Failed to delete resume" }
                    };
                }
            }

        default:
            return {
                status: 405,
                jsonBody: { error: "Method not allowed" }
            };
    }
};

app.http('resume', {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    route: 'resume/{id?}',
    authLevel: 'anonymous',
    handler: withAuth(resume)
});