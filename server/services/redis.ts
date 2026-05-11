import type { Request } from "express";
import { createClient, type RedisJSON } from "redis";

const redisUrl = process.env.IS_CONTAINERIZED === "true" ? "redis://redis:6379" : "redis://localhost:6379";

const redisClient = createClient({
  url: redisUrl,
});

redisClient.on("connect", () => console.log("Redis connected!"));
redisClient.on("error", (err) => console.error("Redis Error:", err));

await redisClient.connect();

// Create or overwrite a cache entry for the given request URL with the provided data
export async function cacheJSONResponse(req: Request, data: RedisJSON, expireSeconds = 3600) {
  const key = req.originalUrl; // use the requested URL as the cache key for simplicity
  console.log("Adding JSON to cache:", key);
  await setCachedJSON(key, data, expireSeconds);
}

// Create or overwrite a cache entry for the given key with the provided data
export async function setCachedJSON(key: string, data: RedisJSON, expireSeconds = 3600) {
  await redisClient.json.set(key, "$", data);
  await redisClient.expire(key, expireSeconds);
}

// Update the cache entry with the given key, only modifying the provided fields
// See http://redis.io/docs/latest/commands/json.merge/ for details
export async function updateCachedJSON(key: string, data: RedisJSON, expireSeconds = 3600) {
  if (!(await redisClient.exists(key))) return;
  console.log("Updating cached JSON:", key);
  await redisClient.json.merge(key, "$", data);
  await redisClient.expire(key, expireSeconds);
}

// Append an item to a cached root array for a single key.
export async function appendToCachedJSONArray(key: string, field: string, item: RedisJSON, expireSeconds = 3600) {
  if (!(await redisClient.exists(key))) return;
  console.log("Appending to cached array:", key, field);
  field = field === "" ? "$" : `$.${field}`;
  await redisClient.json.arrAppend(key, field, item);
  await redisClient.expire(key, expireSeconds);
}

// Append an item to a cached root array for a single key.
export async function removeFromCachedJSONArray(key: string, field: string, item: RedisJSON, expireSeconds = 3600) {
  if (!(await redisClient.exists(key))) return;
  console.log("Removing from cached array:", key, field);
  field = field === "" ? "$" : `$.${field}`;
  const raw = await redisClient.json.get(key, { path: field });
  if (!Array.isArray(raw)) return;

  // Redis JSONPath responses might be wrapped in an extra array layer, so extract the actual data if applicable
  const targetArray = raw.length === 1 && Array.isArray(raw[0]) ? raw[0] : raw;

  const filteredArr = targetArray.filter((i) => JSON.stringify(i) !== JSON.stringify(item));
  if (filteredArr.length === targetArray.length) {
    console.log("Item to remove not found in cached array:", item);
    return;
  }
  await redisClient.json.set(key, field, filteredArr);
  await redisClient.expire(key, expireSeconds);
}

// Delete a cache entry by key
export async function deleteJSONCacheKey(key: string, field = "") {
  console.log("Deleting cache key:", key);
  field = field === "" ? "$" : `$.${field}`;
  await redisClient.json.del(key, { path: field });
}

export default redisClient;
