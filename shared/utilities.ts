// Collection of miscellaneous utility functions used by the client and server

import { checkString } from "./validation";
import axios from "axios";
import { format } from "date-fns";

// Return the current date and time as a string in "mm/dd/yyyy" format, optionally including time in "hh:mmAM/PM" format.
export function getCurrentDateString(includeTime = false) {
  const date = new Date();
  if (includeTime) {
    return format(date, "MM/dd/yyyy hh:mma");
  } else {
    return format(date, "MM/dd/yyyy");
  }
}

// Return the data received from a HTTP GET request to a string URL.
// Does not handle any errors.
export async function getRemoteData(url: string, label: string = "URL") {
  url = checkString(url, label);
  const { data } = await axios.get(url);
  return data;
}

// Return the last piece of a URL path (after the last "/").
export function extractLastPathSegment(url: string, label: string = "URL") {
  url = checkString(url, label);
  const segments = url.split("/");
  return segments[segments.length - 1] || segments[segments.length - 2]; // handle trailing slash
}

// Return a URL path with the last `numSegments` pieces (separated by "/") removed.
// The result does NOT have a trailing slash.
export function removeLastPathSegments(url: string, numSegments: number, label: string = "URL") {
  url = checkString(url, label);
  const segments = url.split("/");
  return segments.slice(0, -numSegments).join("/");
}

// Remove leading and trailing spaces from a string, and replace all whitespace with a single space.
// Return the sanitized string, or throw an error if the string is invalid or empty.
export function sanitizeSpaces(str: string, label: string, minLen?: number, maxLen?: number) {
  str = checkString(str, label, minLen, maxLen);
  return str.replaceAll(/\s+/g, " ");
}

// Return a string in Title Case, where the first letter of each word is capitalized and the rest are unchanged.
export function toTitleCase(str: string, label: string, minLen?: number, maxLen?: number) {
  str = checkString(str, label, minLen, maxLen);
  return str.replace(/\b\w/g, (s) => s.toUpperCase());
}
