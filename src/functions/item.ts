import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { AuthenticatedContext, withAuth } from "../middlewares/withAuth";
import { CreateItemSchema, ItemModel, ItemSchema } from "../models/item.model";
import { createItem, getItemsByUsername } from "../repositories/item.repo";

function parseItem(item: ItemModel): ItemModel {
    return ItemSchema.parse(item);
}

export async function item(request: HttpRequest, context: InvocationContext, auth: AuthenticatedContext): Promise<HttpResponseInit> {

    const username = auth.user.username;

    switch (request.method) {
        case 'GET':
            const items = await getItemsByUsername(username);
            console.log(JSON.stringify(items, null, 2));
            return {
                status: 200,
                jsonBody: items.map(parseItem)
            };

        case 'POST':
            const body = CreateItemSchema.parse(await request.json());

            const newItem: ItemModel = {
                ...body,
                id: crypto.randomUUID(),
                username,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const { resource } = await createItem(newItem);

            if (!resource) {
                return {
                    status: 500,
                    jsonBody: { error: "Failed to create item" }
                };
            }

            return {
                status: 201,
                jsonBody: parseItem(resource)
            };

        default:
            return {
                status: 405,
                jsonBody: { error: "Method Not Allowed" }
            };
    }
};

app.http('item', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: withAuth(item)
});
