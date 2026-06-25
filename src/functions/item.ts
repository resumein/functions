import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { AuthenticatedContext, withAuth } from "../middlewares/withAuth";
import { ItemModel, ItemSchema } from "../models/item.model";
import { createItem, deleteItem, getItemsByUsername, updateItem, createItemsBulk } from "../repositories/item.repo";
import { CreateItemSchema, DeleteItemSchema } from "../schema/item.schema";
import { z } from 'zod';

function parseItem(item: ItemModel): ItemModel {
    return ItemSchema.parse(item);
}

function handleValidationError(err: any): HttpResponseInit {
    if (err instanceof z.ZodError || err.name === 'ZodError') {
        return {
            status: 400,
            jsonBody: {
                error: "Validation failed",
                details: err.issues.map((issue: any) => ({
                    path: issue.path.join('.'),
                    message: issue.message
                }))
            }
        };
    }
    return {
        status: 400,
        jsonBody: { error: err.message || "Invalid request payload" }
    };
}

export async function item(request: HttpRequest, context: InvocationContext, auth: AuthenticatedContext): Promise<HttpResponseInit> {
    const username = auth.user.username;

    try {
        switch (request.method) {
            case 'GET':
                const items = await getItemsByUsername(username);

                return {
                    status: 200,
                    jsonBody: items.map(parseItem)
                };

            case 'POST':
                const body = await request.json();
                if (Array.isArray(body) || request.params.id === 'bulk') {
                    const itemsToValidate = Array.isArray(body) ? body : [];
                    const validatedItems = itemsToValidate.map((item: any) => CreateItemSchema.parse(item));
                    
                    const newItems: ItemModel[] = validatedItems.map(postBody => ({
                        ...postBody,
                        id: crypto.randomUUID(),
                        username,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }));

                    await createItemsBulk(newItems);

                    return {
                        status: 201,
                        jsonBody: newItems.map(parseItem)
                    };
                }

                const postBody = CreateItemSchema.parse(body);

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
                    } else {
                        return {
                            status: 500,
                            jsonBody: { error: "Failed to update item" }
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
    } catch (err: any) {
        if (err instanceof z.ZodError || err.name === 'ZodError') {
            return handleValidationError(err);
        }
        context.error("Error in item function:", err);
        return {
            status: 500,
            jsonBody: { error: err.message || "Internal Server Error" }
        };
    }
}

export async function itemBulk(request: HttpRequest, context: InvocationContext, auth: AuthenticatedContext): Promise<HttpResponseInit> {
    const username = auth.user.username;
    try {
        const body = await request.json();
        if (!Array.isArray(body)) {
            return { status: 400, jsonBody: { error: "Payload must be an array of items" } };
        }
        
        const validatedItems = body.map((item: any) => CreateItemSchema.parse(item));
        
        const newItems: ItemModel[] = validatedItems.map(postBody => ({
            ...postBody,
            id: crypto.randomUUID(),
            username,
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        await createItemsBulk(newItems);

        return {
            status: 201,
            jsonBody: newItems.map(parseItem)
        };
    } catch (err: any) {
        context.error("Failed bulk insert:", err);
        return handleValidationError(err);
    }
}

app.http('itemBulk', {
    methods: ['POST'],
    route: 'item/bulk',
    authLevel: 'anonymous',
    handler: withAuth(itemBulk)
});

app.http('item', {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    route: 'item/{id?}',
    authLevel: 'anonymous',
    handler: withAuth(item)
});