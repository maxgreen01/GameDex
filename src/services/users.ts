import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebaseClient";
import type { userDetails } from "@/types/types";

async function getUserDetails(): Promise<userDetails | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      unsubscribe();

      if (!firebaseUser) {
        resolve(null);
        return;
      }

      let snap = await getDoc(doc(db, "users", firebaseUser.uid));

      if (snap.exists()) {
        let data = snap.data();
        resolve({
          user: firebaseUser,
          username: data.username,
          displayName: data.displayName,
        });
      } else {
        resolve({
          user: firebaseUser,
          username: "User",
          displayName: "User",
        });
      }
    });
  });
}

export default getUserDetails;
