import type { Response } from "express";

// An error class with an HTTP status code attached.
export class StatusError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
  }
}

// An error class thrown when a user or request provides invalid data.
export class BadRequestError extends StatusError {
  constructor(message: string) {
    super(400, message);
    this.name = this.constructor.name;
  }
}

// An error class thrown when a user is denied access to a resource due to being unauthenticated.
export class UnauthorizedError extends StatusError {
  constructor(message: string) {
    super(401, message);
    this.name = this.constructor.name;
  }
}

// An error class thrown when an user is denied access to a resource (even when authenticated).
export class ForbiddenError extends StatusError {
  constructor(message: string) {
    super(403, message);
    this.name = this.constructor.name;
  }
}

// An error class thrown when a desired resource cannot be found.
export class NotFoundError extends StatusError {
  constructor(message: string) {
    super(404, message);
    this.name = this.constructor.name;
  }
}

// Returns the message and status code of an error to be displayed to a client.
export function getErrorInfo(err: unknown): [number, string] {
  if (err instanceof StatusError) {
    console.error(`Error ${err.status}:`, err.message, err.stack);
    return [err.status, err.message];
  } else {
    console.error("Internal error:", err);
    return [500, "Internal server error"]; // Don't expose internal errors to the client
  }
}

// Utility function for responding to HTTP requests following an error.
export function respondWithError(res: Response, err: unknown) {
  const [status, message] = getErrorInfo(err);
  return res.status(status).json({ error: message });
}
