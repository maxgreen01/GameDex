import { Client } from "@elastic/elasticsearch";
import type { ProfileData, User } from "../shared/types.ts";

const esClient = new Client({
  node: "http://elasticsearch:9200",
  auth: {
    username: process.env.ELASTIC_USERNAME || "elastic",
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
          username: { type: "text" },
          displayName: { type: "text" },
          description: { type: "text" },
        },
      },
    });
  }
}

export async function addUserToSearchIndex(user: User | ProfileData) {
  console.log(`Adding user ${user.username} to Elasticsearch index...`);
  try {
    await esClient.index({
      index: USERS_INDEX,
      id: user.username,
      document: {
        username: user.username,
        displayName: user.displayName,
        description: user.description,
      },
    });
  } catch (e) {
    console.error(`Error adding user ${user.username} to Elasticsearch index:`, e);
  }
}

export async function updateUserInSearchIndex(username: string, user: User | ProfileData) {
  console.log(`Updating user ${username} in Elasticsearch index...`);
  try {
    await esClient.update({
      index: USERS_INDEX,
      id: username,
      doc: {
        username: username,
        displayName: user.displayName,
        description: user.description,
      },
    });
  } catch (e) {
    console.error(`Error updating user ${username} in Elasticsearch index:`, e);
  }
}

// Perform full-text search on the users index, prioritizing username, then displayName, then description
export async function searchUsers(query: string) {
  query = query?.trim();
  if (!query) {
    // query must not be empty
    return [];
  }

  try {
    const result = await esClient.search({
      index: USERS_INDEX,
      query: {
        bool: {
          should: [
            {
              match_phrase_prefix: {
                username: {
                  query,
                  boost: 4,
                },
              },
            },
            {
              multi_match: {
                query,
                fields: ["username^4", "displayName^3", "description"],
                fuzziness: "AUTO",
              },
            },
          ],
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
