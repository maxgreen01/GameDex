import validator from "validator";
import { compareAsc, isValid, parse, format } from "date-fns";

export const validateSignup = (email: string, password: string, username: string, displayName: string) => {

  email = checkString(email, "Email").toLowerCase();
  password = checkString(password, "Password");
  username = checkString(username, "Username");
  displayName = checkString(displayName, "Display name");

  if (!validator.isEmail(email)) {
    throw new Error("Invalid email format");
  }

  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    throw new Error("Password must have at least 8 characters, 1 uppercase character, 1 number, and 1 special character.");
  }

  if (username.length < 5 || username.length > 20) {
    throw new Error("Username length invalid");
  }

  if (!validator.isAlphanumeric(username)) {
    throw new Error("Username must be alphanumeric");
  }

  if (displayName.length < 5 || displayName.length > 20) {
    throw new Error("Display name length invalid");
  }

  if (!validator.isAlphanumeric(displayName)) {
    throw new Error("Display name must be alphanumeric");
  }
};

export const validateLogin = (email: string, password: string) => {
  email = checkString(email, "Email").toLowerCase();
  password = checkString(password, "Password");

  if (!validator.isEmail(email)) {
    throw new Error("Invalid email format");
  }  
};

 export const checkString = (strVal: string, fieldName: string) => {
    if (!strVal) throw new Error(`${fieldName} was not supplied.`);
    if (typeof strVal !== 'string') throw new Error(`${fieldName} must be a string!`);
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw new Error(`${fieldName} cannot be an empty string or a string with just spaces`);
    return strVal;
};


//
// ============ Date Utilities ============
//
// Throw an error if a string does not represent a valid date with the format `MM/DD/YYYY` after the year 1900.
// Return an object containing the trimmed string and the Date object corresponding to the input date.
export function validateDateStr(dateStr : string, label = "Date") {
    dateStr = checkString(dateStr, label);
    const parsedDate = parse(dateStr, "MM/dd/yyyy", new Date());
    if (!isValid(parsedDate)) throw new Error(`${label} "${dateStr}" is not valid with format "MM/DD/YYYY"`);
    if (parsedDate.getFullYear() < 1900) throw new Error(`${label} "${dateStr}" cannot be before the year 1900`);
    return { dateStr, parsedDate };
}

// Return the current date and time as a string in "mm/dd/yyyy hh:mmAM/PM" format.
export function getCurrentDateString(includeTime = false) {
    const date = new Date();
    if (includeTime) {
        return format(date, "MM/dd/yyyy hh:mma");
    } else {
        return format(date, "MM/dd/yyyy");
    }
}

// Return whether a date string is before today's date (not considering time).
// Throw an error if the string does not represent a valid date with the format `MM/DD/YYYY`.
export function isDateStringBeforeToday(dateStr : string, label = "Date") {
    const date = validateDateStr(dateStr, label).parsedDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0); //  only consider date, not time
    const cmp = compareAsc(date, today);
    return cmp == -1;
}