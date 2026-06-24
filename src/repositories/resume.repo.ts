import { dataContainer } from "../config/cosmos";
import { ResumeModel } from "../models/resume.model";

export async function getResumesByUsername(username: string) {
    const query = {
        query: `
            SELECT * FROM c
            WHERE c.username = @username
            AND c.type = @type
        `,
        parameters: [
            { name: "@username", value: username },
            { name: "@type", value: "resume" }
        ]
    };

    const { resources } = await dataContainer.items.query<ResumeModel>(query, {partitionKey: username}).fetchAll();
    return resources;
}

export async function createResume(resume: ResumeModel) {
    return dataContainer.items.create<ResumeModel>(resume);
}

export async function updateResume(resume: ResumeModel) {
    return dataContainer.item(resume.id, resume.username).replace(resume);
}

export async function deleteResume(id: string, username: string) {
    return dataContainer.item(id, username).delete();
}