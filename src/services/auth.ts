import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import validator from 'validator';
import helpers from '../../helpers.ts';

export const signup = async (email: string, password: string, username: string, displayName: string) => {
  
  //String checking for all four string inputs (look at helpers.ts if u wanna see the method).
  username = helpers.checkString(username, 'Username');
  displayName = helpers.checkString(displayName, 'Display name');
  email = helpers.checkString(email, 'Email').toLowerCase();
  password = helpers.checkString(password, 'Password');

  //Ensuring that an email is of valid format. 
  if(!validator.isEmail(email)) throw new Error("Email is of invalid format.");

  //Password Requirements (we can change this later, but for now it's 8 characters, 1 uppercase char, 1 special char)
  if(!validator.isStrongPassword(password, {minLength: 8, minUppercase: 1, minNumbers: 1, minSymbols:1})) throw new Error("Password must have 8 total characters, 1 uppercase character, 1 number, and 1 special character.");

  //Username requirements (we can change this later, but for now I just had a length requirement and alphanumeric requirement.)
  if(username.length < 5 || username.length > 20) throw new Error("Username must be between 5 and 20 characters long.");
  if(!validator.isAlphanumeric(username)) throw new Error("Username must be alphanumeric.");

  //Display name requirements (same as username)
  if (displayName.length < 5 || displayName.length > 20) throw new Error("Display name must be between 5 and 20 characters long.");
  if(!validator.isAlphanumeric(displayName)) throw new Error("Display name must be alphanumeric.");

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "users", userCred.user.uid), {
      username,
      displayName,
      email,
      createdAt: Date.now(),
    });

    return userCred.user;
  }
  catch(e: any) {
    throw new Error(e.message || "Signup failed.");
  }

};

export const login = async (email: string, password: string) => {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    return userCred.user;
  }
  catch (e: any) {
    throw new Error(e.message || "Login failed.");
  }
};