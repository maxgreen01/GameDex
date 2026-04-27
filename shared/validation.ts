// Collection of validation functions used by the client and server

import validator from "validator";
import { parse, isValid, compareAsc } from "date-fns";

// custom error class to identify validation errors (i.e. HTTP 400 errors) as opposed to server errors
export class ValidationError extends Error {
  constructor(message: string) {
      super(message);
      this.name = this.constructor.name;
  }
}

//
// ============ String Validation ============
//

// Throw an error if a variable is undefined, not a string, or has length outside the specified bounds.
// If `minLen` is `undefined`, throw an error if the string is empty. To allow empty strings, use `minLen = 0`.
// Return the trimmed string if it is valid.
export const checkString = (str: string, label: string, minLen?: number, maxLen?: number) => {
  if (typeof str == "undefined") throw new ValidationError(`${label} was not supplied`);
  if (typeof str !== 'string') throw new ValidationError(`${label} must be a string`);
  str = str.trim();
  if (typeof minLen === "undefined" && str.length === 0)
    throw new ValidationError(`${label} cannot be empty or contain only spaces`);
  if (typeof minLen !== "undefined" && str.length < minLen) throw new ValidationError(`${label} is shorter than ${minLen} character(s)`);
  if (typeof maxLen !== "undefined" && str.length > maxLen) throw new ValidationError(`${label} is longer than ${maxLen} character(s)`);
  return str;
};

// Throw an error if the trimmed string does not match the given regex, or has length outside the specified bounds.
// Return the trimmed string if it is valid.
export function validateStrUsingRegex(str: string, regex: RegExp, label = "String", minLen?: number, maxLen?: number, errorMsg: string = "disallowed") {
  str = checkString(str, label, minLen, maxLen);
  if (!str.match(regex)) throw new ValidationError(`${label} contains ${errorMsg} characters`);
  return str;
}

// Throw an error if the trimmed string contains any letters other than a-z or A-Z, or has length outside the specified bounds.
// To allow numbers, use `options.allowNumbers = true`. To allow specific non-alphabetical characters, include them
// in `options.ignoreChars` (e.g. `options.ignoreChars = " -"` to allow spaces and hyphens).
// Return the trimmed string if it is valid.
export function validateAlphabetical(str: string, label: string = "String", options?: {allowNumbers?: boolean, ignoreChars?: string}, minLen?: number, maxLen?: number) {
  str = checkString(str, label, minLen, maxLen);
  const ignoreChars = options?.ignoreChars ?? "" + (options?.allowNumbers ? "0123456789" : "");
  if (!validator.isAlpha(str, "en-US", { ignore: ignoreChars })) {
    throw new ValidationError(`${label} must be ${options?.allowNumbers ? "alphanumeric" : "alphabetical"}${options?.ignoreChars ? `or contain the following characters: '${options.ignoreChars}'` : ""}`);
  }
  return str;
}

// Throw an error if a trimmed string matches one of the provided options.
// Return the trimmed string if it is valid.
export function validateOptions(str: string, options: string[], label: string = "String", caseInsensitive: boolean = false) {
  str = checkString(str, label);
  if (caseInsensitive) {
    str = str.toLowerCase();
    options = options.map((s) => s.toLowerCase());
  }
  if (!options.includes(str)) throw new ValidationError(`${label} does not match one of the allowed options`);
  return str;
}


//
// ============ Number-Related Validation ============
//

// Throw an error if the input is not a Number, is NaN, or is outside the given bounds (which are inclusive).
// Return the given number if it is valid.
export function checkNumber(num: number, label: string = "Number", min?: number, max?: number) {
  if (typeof num !== "number" || Number.isNaN(num)) throw new ValidationError(`${label} must be a number`);
  if ((min !== undefined && num < min) || (max !== undefined && num > max)) throw new ValidationError(`${label} is out of range ${min} to ${max}`);
  return num;
}

// Throw an error if the input is not a Number, is NaN, or is outside the given bounds (inclusive).
// Also throw an error if the number is not an integer.
// Return the given integer if it is valid.
export function validateInteger(int: number, label: string = "Number", min?: number, max?: number) {
  int = checkNumber(int, label, min, max);
  if (!Number.isInteger(int)) throw new ValidationError(`${label} is not an integer`);
  return int;
}

// Convert a string to an integer, and throw an error if the string doesn't represent an integer
// or the integer is outside the given bounds (which are inclusive).
// Return the converted integer if it is valid.
export function convertStrToInt(str: string, label: string = "Integer", min?: number, max?: number) {
  if (!validator.isInt(str)) throw new ValidationError(`${label} must represent an integer`);
  return checkNumber(Number.parseInt(str), label, min, max);
}

// Convert a string to a float, and throw an error if the string doesn't represent a float
// or the float is outside the given bounds (which are inclusive).
// Return the converted float if it is valid.
export function convertStrToFloat(str: string, label: string = "Float", min?: number, max?: number) {
 if (!validator.isFloat(str)) throw new ValidationError(`${label} must represent a float`);
  return checkNumber(Number.parseFloat(str), label, min, max);
}


//
// ============ Database-Related Validation ============
//

// Validate all the required signup fields, and throw an error if any of them are invalid.
export const validateSignup = (email: string, password: string, username: string, displayName: string) => {
  validateEmail(email);
  validatePassword(password);
  validateUsername(username);
  validateDisplayName(displayName);
};

// Validate all the required login fields, and throw an error if any of them are invalid.
export const validateLogin = (email: string, password: string) => {
  validateEmail(email);
  validatePassword(password);
};

// Throw an error if a string is not a valid `username`.
// A `username` is considered valid if it is alphanumeric and contains between 5 and 20 characters.
// Return the trimmed `username` (converted to lowercase for case-insensitive operations) if it is valid.
export function validateUsername(username: string) {
  return validateAlphabetical(username, "Username", {}, 5, 20).toLowerCase();
}

// Throw an error if a string is not a valid Display Name.
// A Display Name is considered valid if it is alphanumeric (including numbers, spaces, underscores, and hyphens) and contains between 5 and 20 characters.
// Return the trimmed Display Name if it is valid.
export function validateDisplayName(displayName: string) {
  return validateAlphabetical(displayName, "Display Name", { allowNumbers: true, ignoreChars: " _-" }, 5, 20);
}

// Passwords must be non-empty, have at least 8 characters, and have no spaces, at least one uppercase character, one number, and one symbol.
// Throw an error if a password is not valid, or return the trimmed string if it's valid.
export function validatePassword(password: string) {
  if (typeof password !== "string" || password.length < 8) throw new ValidationError(`Password is invalid or shorter than 8 characters`); // don't trim passwords
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
    throw new ValidationError("Password must contain at least one lowercase character, uppercase character, number, and symbol, and cannot contain spaces");
  }
}

// Throw an error if a string is not a valid email address.
// Return the trimmed email in all lowercase if it is valid.
export function validateEmail(email: string, label: string = "Email") {
    email = checkString(email, label);
    if (!validator.isEmail(email)) throw new ValidationError(`${label} is not valid`);
    return email.toLowerCase();
}


//
// ============ Date Validation ============
//

// Throw an error if a string does not represent a valid date with the format `MM/DD/YYYY` after the year 1900.
// Return an object containing the trimmed string and the Date object corresponding to the input date.
export function validateDateStr(dateStr: string, label: string = "Date") {
    dateStr = checkString(dateStr, label, 10, 10);
    const parsedDate = parse(dateStr, "MM/dd/yyyy", new Date());
    if (!isValid(parsedDate)) throw new ValidationError(`${label} "${dateStr}" does not have format "MM/DD/YYYY"`);
    if (parsedDate.getFullYear() < 1900) throw new ValidationError(`${label} "${dateStr}" cannot be before the year 1900`);
    return { dateStr, parsedDate };
}

// Return whether a date string is before today's date (not considering time).
// Throw an error if the string does not represent a valid date with the format `MM/DD/YYYY`.
export function isDateStringBeforeToday(dateStr: string, label: string = "Date") {
    const date = validateDateStr(dateStr, label).parsedDate;
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
export function validateArrayElements(arr: unknown[], label: string = "Array", func: (item: unknown) => unknown, numElements: number = 0) {
    if (!Array.isArray(arr)) throw new ValidationError(`${label} is not an array`);
    if (numElements !== -1 && arr.length === 0) throw new ValidationError(`${label} is empty`); // skip the empty check if `numElements == -1`
    if (numElements > 0 && arr.length !== numElements) throw new ValidationError(`${label} does not have ${numElements} elements`);
    return arr.map(func);
}

// Throw an error if an object contains any fields other than the allowed ones, which are passed as an array of strings.
// The object is not *required* to have all of these fields, because the value of each field should be checked individually and separately.
// Return the original object if it only contains valid fields.
export function validateObjectKeys(obj: Record<string, unknown>, allowedFields: string[], label: string = "Object") {
    if (typeof obj !== "object") throw new ValidationError(`${label} must be an object`);
    validateArrayElements(allowedFields, `${label}'s required fields`, (field) => {
        if (typeof field !== "string") throw new ValidationError(`${label}'s required field names must be strings`);
    });

    // find and report disallowed fields
    const objKeys = Object.keys(obj);
    const invalidFields = objKeys.filter((key) => !allowedFields.includes(key));
    if (invalidFields.length > 0) {
        throw new ValidationError(`${label} contains invalid fields: ${JSON.stringify(invalidFields)}`);
    }
    return obj;
}
