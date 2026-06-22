// src/config/cosmos.ts

import { CosmosClient } from "@azure/cosmos";

const client = new CosmosClient({
  connectionString : process.env.COSMOS_CONN!
});

const database = client.database("resumein");

export const dataContainer = database.container("Data");

export default client;