import type { Request, Response } from "express";
import { respondWithError } from "../../shared/errors.ts";
import redisClient from "../services/redis";

// If the requested GET query is cached, return it now instead of going to the route handler
export async function checkCache(req: Request, res: Response, next: () => unknown) {
  try {
    // Only cache GET requests for simplicity
    if (req.method !== "GET") {
      console.log(`Not checking cache for non-GET request to ${req.originalUrl}`);
      return next();
    }

    const cacheKey = req.originalUrl; // use the requested URL as the cache key for simplicity since we're only caching entire routes
    if (await redisClient.exists(cacheKey)) {
      // Cache hit
      console.log(`Cache hit on route ${cacheKey}`);
      return res.json(await redisClient.json.get(cacheKey));
    }

    // Cache miss - continue to the route handler
    return next();
  } catch (e) {
    return respondWithError(res, e);
  }
}
