import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { AuthenticatedContext, withAuth } from "../middlewares/withAuth";
import { ItemModel, ItemSchema } from "../models/item.model";
import { createItem, deleteItem, getItemsByUsername } from "../repositories/item.repo";
import { CreateItemSchema, DeleteItemSchema } from "../schema/item.schema";

function parseItem(item: ItemModel): ItemModel {
    return ItemSchema.parse(item);
}

export async function item(request: HttpRequest, context: InvocationContext, auth: AuthenticatedContext): Promise<HttpResponseInit> {

    const username = auth.user.username;

    switch (request.method) {
        case 'GET':
            const items = await getItemsByUsername(username);

            return {
                status: 200,
                jsonBody: items.map(parseItem)
            };

        case 'POST':
            const postBody = CreateItemSchema.parse(await request.json());

            const newItem: ItemModel = {
                ...postBody,
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

        case 'DELETE':
            const itemId = request.params.id;
            if (!itemId) {
                return {
                    status: 400,
                    jsonBody: { error: "Missing item ID" }
                };
            }

            try {
                await deleteItem(itemId, username);

                return {
                    status: 204
                };
            } catch {
                return {
                    status: 404,
                    jsonBody: { error: "Item not found" }
                };
            }

        default:
            return {
                status: 405,
                jsonBody: { error: "Method Not Allowed" }
            };
    }
};

app.http('item', {
    methods: ['GET', 'POST', 'DELETE'],
    route: 'item/{id?}',
    authLevel: 'anonymous',
    handler: withAuth(item)
});