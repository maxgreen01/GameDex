// Collection of validation functions used by the client and server

import validator from "validator";
import { parse, isValid, compareAsc } from "date-fns";
import { BadRequestError } from "./errors.ts";
import type { LoginData, ProfileData, SignupData } from "./types.ts";

//
// ============ String Validation ============
//

// Throw an error if a variable is undefined, not a string, or has length outside the specified bounds.
// If `minLen` is `undefined`, throw an error if the string is empty. To allow empty strings, use `minLen = 0`.
// Return the trimmed string if it is valid.
export function validateString(data: unknown, label: string, minLen?: number, maxLen?: number) {
  if (typeof data == "undefined") throw new BadRequestError(`${label} was not supplied`);
  if (typeof data !== "string") throw new BadRequestError(`${label} must be a string`);
  const str = (data as string).trim();
  if (typeof minLen === "undefined" && str.length === 0) throw new BadRequestError(`${label} cannot be empty or contain only spaces`);
  if (typeof minLen !== "undefined" && str.length < minLen) throw new BadRequestError(`${label} is shorter than ${minLen} character(s)`);
  if (typeof maxLen !== "undefined" && str.length > maxLen) throw new BadRequestError(`${label} is longer than ${maxLen} character(s)`);
  return str;
}

// Throw an error if the trimmed string does not match the given regex, or has length outside the specified bounds.
// Return the trimmed string if it is valid.
export function validateStrUsingRegex(data: unknown, regex: RegExp, label = "String", minLen?: number, maxLen?: number, errorMsg: string = "disallowed") {
  const str = validateString(data, label, minLen, maxLen);
  if (!str.match(regex)) throw new BadRequestError(`${label} contains ${errorMsg} characters`);
  return str;
}

// Throw an error if the trimmed string contains any letters other than a-z or A-Z, or has length outside the specified bounds.
// To allow numbers, use `options.allowNumbers = true`. To allow specific non-alphabetical characters, include them
// in `options.ignoreChars` (e.g. `options.ignoreChars = " -"` to allow spaces and hyphens).
// Return the trimmed string if it is valid.
export function validateAlphabetical(data: unknown, label: string = "String", options?: { allowNumbers?: boolean; ignoreChars?: string }, minLen?: number, maxLen?: number) {
  const str = validateString(data, label, minLen, maxLen);
  const ignoreChars = options?.ignoreChars ?? "" + (options?.allowNumbers ? "0123456789" : "");
  if (!validator.isAlpha(str, "en-US", { ignore: ignoreChars })) {
    throw new BadRequestError(`${label} must be ${options?.allowNumbers ? "alphanumeric" : "alphabetical"}${options?.ignoreChars ? `or contain the following characters: '${options.ignoreChars}'` : ""}`);
  }
  return str;
}

// Throw an error if a trimmed string matches one of the provided options.
// Return the trimmed string if it is valid.
export function validateOptions(data: unknown, options: string[], label: string = "String", caseInsensitive: boolean = false) {
  let str = validateString(data, label);
  if (caseInsensitive) {
    str = str.toLowerCase();
    options = options.map((s) => s.toLowerCase());
  }
  if (!options.includes(str)) throw new BadRequestError(`${label} does not match one of the allowed options`);
  return str;
}

//
// ============ Number-Related Validation ============
//

// Throw an error if the input is not a Number, is NaN, or is outside the given bounds (which are inclusive).
// Return the given number if it is valid.
export function validateNumber(data: unknown, label: string = "Number", min?: number, max?: number) {
  if (typeof data !== "number" || Number.isNaN(data)) throw new BadRequestError(`${label} must be a number`);
  const num = data as number;
  if ((min !== undefined && num < min) || (max !== undefined && num > max)) throw new BadRequestError(`${label} is out of range ${min} to ${max}`);
  return num;
}

// Throw an error if the input is not a Number, is NaN, or is outside the given bounds (inclusive).
// Also throw an error if the number is not an integer.
// Return the given integer if it is valid.
export function validateInteger(data: unknown, label: string = "Number", min?: number, max?: number) {
  const int = validateNumber(data, label, min, max);
  if (!Number.isInteger(int)) throw new BadRequestError(`${label} is not an integer`);
  return int;
}

// Convert a string to an integer, and throw an error if the string doesn't represent an integer
// or the integer is outside the given bounds (which are inclusive).
// Return the converted integer if it is valid.
export function convertStrToInt(str: string, label: string = "Integer", min?: number, max?: number) {
  if (!validator.isInt(str)) throw new BadRequestError(`${label} must represent an integer`);
  return validateNumber(Number.parseInt(str), label, min, max);
}

// Convert a string to a float, and throw an error if the string doesn't represent a float
// or the float is outside the given bounds (which are inclusive).
// Return the converted float if it is valid.
export function convertStrToFloat(str: string, label: string = "Float", min?: number, max?: number) {
  if (!validator.isFloat(str)) throw new BadRequestError(`${label} must represent a float`);
  return validateNumber(Number.parseFloat(str), label, min, max);
}

//
// ============ Database-Related Validation ============
//

// Throw an error if the input is not an object or is null.
// Return the input object if it is valid.
export function validateObject(data: unknown, label: string = "Object") {
  if (typeof data !== "object" || data === null) throw new BadRequestError(`${label} must be an object`);
  return data as Record<string, unknown>;
}

// Validate all the required signup fields, and throw an error if any of them are invalid.
// Return the signup data object if all fields are valid.
export function validateSignup(data: unknown) {
  const obj = validateObject(data, "Signup Data");
  return {
    email: validateEmail(obj.email),
    username: validateUsername(obj.username),
    displayName: validateDisplayName(obj.displayName),
    password: validatePassword(obj.password),
  } as SignupData;
}

// Validate all the required login fields, and throw an error if any of them are invalid.
// Return the login data object if all fields are valid.
export function validateLogin(data: unknown) {
  const obj = validateObject(data, "Login Data");
  return {
    email: validateEmail(obj.email),
    password: validatePassword(obj.password),
  } as LoginData;
}

// Throw an error if a string is not a valid `username`.
// A `username` is considered valid if it is alphanumeric and contains between 5 and 20 characters.
// Return the trimmed `username` (converted to lowercase for case-insensitive operations) if it is valid.
export function validateUsername(data: unknown) {
  return validateAlphabetical(data, "Username", {}, 5, 20).toLowerCase();
}

// Throw an error if a string is not a valid Display Name.
// A Display Name is considered valid if it is alphanumeric (including numbers, spaces, underscores, and hyphens) and contains between 5 and 20 characters.
// Return the trimmed Display Name if it is valid.
export function validateDisplayName(data: unknown) {
  return validateAlphabetical(data, "Display Name", { allowNumbers: true, ignoreChars: " _-" }, 5, 20);
}

// Passwords must be non-empty, have at least 8 characters, and have no spaces, at least one uppercase character, one number, and one symbol.
// Throw an error if a password is not valid, or return the trimmed string if it's valid.
export function validatePassword(data: unknown) {
  if (typeof data !== "string" || (data as string).length < 8) throw new BadRequestError(`Password is invalid or shorter than 8 characters`); // don't trim passwords
  const password = data as string;
  const hasSpace = /\s/.test(password);
  const isStrong = validator.isStrongPassword(password, {
    minLength: 8,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });
  if (isStrong && !hasSpace) {
    return password;
  } else {
    throw new BadRequestError("Password must contain at least one lowercase character, uppercase character, number, and symbol, and cannot contain spaces");
  }
}

// Throw an error if a string is not a valid email address.
// Return the trimmed email in all lowercase if it is valid.
export function validateEmail(data: unknown, label: string = "Email") {
  const email = validateString(data, label);
  if (!validator.isEmail(email)) throw new BadRequestError(`${label} is not valid`);
  return email.toLowerCase();
}

// Throw an error if a string is provided but does not match the format of "Bearer <token>".
// Return the string if it is valid; returns null if no string is provided.
export function validateAuthHeader(data: unknown, label: string = "Authorization Header") {
  if (data === undefined) return undefined;
  const authHeader = validateString(data, label);
  if (!authHeader.startsWith("Bearer ")) {
    throw new BadRequestError(`${label} does not follow the required format`);
  } else {
    return authHeader.split("Bearer ")[1];
  }
}

// Throw an error if a profile data object is invalid; return it if it is.
export function validateProfileData(data: unknown, label: string = "Profile Data") {
  const obj = validateObject(data, label);
  return {
    displayName: validateDisplayName(obj.displayName),
    description: validateString(obj.description, "Description", 0),
  } as ProfileData;
}

//
// ============ Date Validation ============
//

// Throw an error if a string does not represent a valid date with the format `MM/DD/YYYY` after the year 1900.
// Return an object containing the trimmed string and the Date object corresponding to the input date.
export function validateDateStr(data: unknown, label: string = "Date") {
  const dateStr = validateString(data, label, 10, 10);
  const parsedDate = parse(dateStr, "MM/dd/yyyy", new Date());
  if (!isValid(parsedDate)) throw new BadRequestError(`${label} "${dateStr}" does not have format "MM/DD/YYYY"`);
  if (parsedDate.getFullYear() < 1900) throw new BadRequestError(`${label} "${dateStr}" cannot be before the year 1900`);
  return { dateStr, parsedDate };
}

// Return whether a date string is before today's date (not considering time).
// Throw an error if the string does not represent a valid date with the format `MM/DD/YYYY`.
export function isDateStringBeforeToday(data: unknown, label: string = "Date") {
  const date = validateDateStr(data, label).parsedDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0); //  only consider date, not time
  const cmp = compareAsc(date, today);
  return cmp == -1;
}

//
// ============ Misc Validation ============
//

// Throw an error if a variable is undefined, not an array, or an empty array.
// Optionally, use `numElements` to ensure that the array has exactly the number of specified elements,
// or set `numElements` to -1 to allow any number of elements (including zero).
// If valid, run `map` on the array using the given function and return the result.
export function validateArrayElements<T>(data: unknown, func: (item: unknown) => T, label: string = "Array", numElements: number = 0) {
  if (!Array.isArray(data)) throw new BadRequestError(`${label} is not an array`);
  const arr = data as unknown[];
  if (numElements !== -1 && arr.length === 0) throw new BadRequestError(`${label} is empty`); // skip the empty check if `numElements == -1`
  if (numElements > 0 && arr.length !== numElements) throw new BadRequestError(`${label} does not have ${numElements} elements`);
  return arr.map(func);
}

// Throw an error if an object contains any fields other than the allowed ones, which are passed as an array of strings.
// The object is not *required* to have all of these fields, because the value of each field should be checked individually and separately.
// Return the original object if it only contains valid fields.
export function validateObjectKeys(data: unknown, fieldData: unknown, label: string = "Object") {
  const obj = validateObject(data, label);
  const allowedFields = validateArrayElements(
    fieldData,
    (field) => {
      if (typeof field !== "string") throw new BadRequestError(`${label}'s required field names must be strings`);
      return label as string;
    },
    `${label}'s required fields`
  );

  // find and report disallowed fields
  const objKeys = Object.keys(obj);
  const invalidFields = objKeys.filter((key) => !allowedFields.includes(key));
  if (invalidFields.length > 0) {
    throw new BadRequestError(`${label} contains invalid fields: ${JSON.stringify(invalidFields)}`);
  }
  return obj;
}
