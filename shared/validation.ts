import validator from "validator";

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