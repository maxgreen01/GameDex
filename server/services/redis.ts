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
  await redisClient.json.merge(key, "$", data);
  await redisClient.expire(key, expireSeconds);
}

// Append an item to a cached root array for a single key.
export async function appendToCachedJSONArray(key: string, field: string, item: RedisJSON, expireSeconds = 3600) {
  if (!(await redisClient.exists(key))) return;
  field = field === "" ? "$" : `$.${field}`;
  await redisClient.json.arrAppend(key, field, item);
  await redisClient.expire(key, expireSeconds);
}

// Append an item to a cached root array for a single key.
export async function removeFromCachedJSONArray(key: string, field: string, item: RedisJSON, expireSeconds = 3600) {
  if (!(await redisClient.exists(key))) return;
  field = field === "" ? "$" : `$.${field}`;
  const arr = await redisClient.json.get(key, { path: field });
  if (!Array.isArray(arr)) return;

  const filteredArr = arr.filter((i) => JSON.stringify(i) !== JSON.stringify(item));
  await redisClient.json.set(key, field, filteredArr);
  await redisClient.expire(key, expireSeconds);
}

// Delete a cache entry by key
export async function deleteCacheKey(key: string) {
  await redisClient.del(key);
}

export default redisClient;
