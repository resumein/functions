import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { AuthenticatedContext, withAuth } from "../middlewares/withAuth";
import { ItemModel, ItemSchema } from "../models/item.model";
import { createItem, deleteItem, getItemsByUsername, updateItem } from "../repositories/item.repo";
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

        case 'PUT':
            const itemIdToUpdate = request.params.id;

            if (!itemIdToUpdate) {
                return {
                    status: 400,
                    jsonBody: { error: "Missing item ID" }
                };
            }

            const putBody = CreateItemSchema.parse(await request.json());

            const updatedItem: ItemModel = {
                ...putBody,
                id: itemIdToUpdate,
                username,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            try {
                const { resource } = await updateItem(updatedItem);

                return {
                    status: 200,
                    jsonBody: parseItem(resource)
                };
            } catch (error) {
                if (error.code === 404) {
                    return {
                        status: 404,
                        jsonBody: { error: "Item not found" }
                    };
                }        
            }

        case 'DELETE':
            const itemIdToDelete = request.params.id;
            if (!itemIdToDelete) {
                return {
                    status: 400,
                    jsonBody: { error: "Missing item ID" }
                };
            }

            try {
                await deleteItem(itemIdToDelete, username);

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
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    route: 'item/{id?}',
    authLevel: 'anonymous',
    handler: withAuth(item)
});