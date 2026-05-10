import esClient, { createUserIndex, USERS_INDEX } from "../server/elasticsearch.ts";
import { db } from "../server/firebaseAdmin.ts";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForElasticsearch(retries = 5, delayMs = 10000) {
  console.log("Starting to wait for Elasticsearch...");
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await esClient.cluster.health({
        wait_for_status: "yellow",
        timeout: "30s",
      });
      console.log("Elasticsearch is ready!");
      return;
    } catch (e) {
      if (attempt === retries) {
        throw e;
      }

      console.log("Waiting for Elasticsearch..., error:", e.message);
      await delay(delayMs);
    }
  }
}

async function seedUsersIndex() {
  // don't start until Elasticsearch is running properly
  await waitForElasticsearch();

  // create the index, deleting the index first if it already exists
  const indexExists = await esClient.indices.exists({ index: USERS_INDEX });
  if (indexExists) {
    await esClient.indices.delete({ index: USERS_INDEX });
  }
  await createUserIndex();

  console.log("Seeding Elasticsearch users index with Firestore data...");

  // fetch all users from Firestore
  const snapshot = await db.collection("users").get();
  const users = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  if (users.length === 0) {
    return;
  }

  // load all the users into the users index
  await esClient.helpers.bulk({
    datasource: users,
    onDocument: (doc) => {
      // `doc` represents each individual User object
      return [
        // first object is the action that should be taken (i.e. add to index)
        {
          index: { _index: USERS_INDEX, _id: doc.id },
        },
        // second object is the data to be indexed
        {
          username: doc.username,
          displayName: doc.displayName,
          description: doc.description,
        },
      ];
    },
  });

  return users.length;
}

// actually run the operation
try {
  const userCount = await seedUsersIndex();
  console.log(`Successfully seeded Elasticsearch users index with ${userCount} users!`);
} catch (e) {
  console.error("Failed to seed Elasticsearch users index:", e);
}
