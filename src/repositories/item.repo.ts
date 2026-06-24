import { dataContainer } from "../config/cosmos";
import { ItemModel, ItemType } from "../models/item.model";

export async function getItemsByUsername(username: string, type?: ItemType) {
    const query = type
        ? {
            query: `
                SELECT * FROM c
                WHERE c.username = @username
                AND c.type = @type
            `,
            parameters: [
                { name: "@username", value: username },
                { name: "@type", value: type }
            ]
        }
        : {
            query: `
                SELECT * FROM c
                WHERE c.username = @username
                AND ARRAY_CONTAINS(
                    ["project", "education", "experience", "certification", "award"],
                    c.type
                )
            `,
            parameters: [
                { name: "@username", value: username }
            ]
        };

    const { resources } = await dataContainer.items
        .query<ItemModel>(query, {
            partitionKey: username
        })
        .fetchAll();

    return resources;
}

export function deleteItem(id: string, username: string) {
    return dataContainer.item(id, username).delete();
}

export function updateItem(item: ItemModel) {
    return dataContainer.item(item.id, item.username).replace(item);
}

export function createItem(item: ItemModel) {
    return dataContainer.items.create<ItemModel>(item);
}
