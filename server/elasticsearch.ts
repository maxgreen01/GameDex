import { Client } from "@elastic/elasticsearch";
import type { User } from "../shared/types.ts";

const esClient = new Client({
  node: "http://elasticsearch:9200",
  auth: {
    username: process.env.ELASTIC_USERNAME || "",
    password: process.env.ELASTIC_PASSWORD || "",
  },
});

export const USERS_INDEX = "users";

export async function createUserIndex() {
  const indexExists = await esClient.indices.exists({ index: USERS_INDEX });
  if (!indexExists) {
    await esClient.indices.create({
      index: USERS_INDEX,
      mappings: {
        properties: {
          username: { type: "keyword" },
          displayName: { type: "text" },
          description: { type: "text" },
        },
      },
    });
  }
}

export async function addUserToIndex(user: User) {
  try {
    await esClient.index({
      index: USERS_INDEX,
      id: user.username,
      document: user,
    });
  } catch (e) {
    console.error(`Error adding user ${user.username} to Elasticsearch index:`, e);
  }
}

export async function updateUserInIndex(user: User) {
  try {
    await esClient.update({
      index: USERS_INDEX,
      id: user.username,
      doc: user,
    });
  } catch (e) {
    console.error(`Error updating user ${user.username} in Elasticsearch index:`, e);
  }
}

// Perform full-text search on the users index, prioritizing username, then displayName, then description
export async function searchUsers(query: string) {
  try {
    const result = await esClient.search({
      index: USERS_INDEX,
      query: {
        multi_match: {
          query,
          fields: ["username^3", "displayName^2", "description"],
        },
      },
    });
    return result.hits.hits.map((hit) => hit._source);
  } catch (e) {
    console.error(`Error searching users in Elasticsearch index:`, e);
    return [];
  }
}

export default esClient;
