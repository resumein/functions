import { app, HttpResponseInit } from "@azure/functions";

export async function ping(): Promise<HttpResponseInit> {
    return { body: JSON.stringify({ message: "pong" })};
};

app.http('ping', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: ping
});
