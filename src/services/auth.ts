import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../firebaseClient";

export const login = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);

    const token = await userCred.user.getIdToken();

    return {
      user: userCred.user,
      token,
    };
  } catch (e: any) {
    throw new Error(e.message || "Login failed.");
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (e: any) {
    throw new Error(e.message || "Logout failed.");
  }
};
