import type { Request, Response } from "express";
import { auth } from "../services/firebaseAdmin.ts";
import { getUserById } from "../data/users.ts";
import { respondWithError, UnauthorizedError } from "../../shared/errors.ts";
import type { User } from "../../shared/types.ts";
import { validateAuthHeader } from "../../shared/validation.ts";

export interface AuthenticatedRequest extends Request {
  user: User;
}

export async function requireAuth(req: Request, res: Response, next: () => unknown) {
  try {
    const token = validateAuthHeader(req.headers.authorization);
    if (token === undefined) throw new UnauthorizedError("Authorization header is missing or invalid");
    const decodedToken = await auth.verifyIdToken(token);
    (req as AuthenticatedRequest).user = await getUserById(decodedToken.uid);
  } catch (e) {
    return respondWithError(res, e);
  }
  return next();
}
