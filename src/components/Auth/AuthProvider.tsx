import { onAuthStateChanged } from "firebase/auth";
import { onSnapshot, doc } from "firebase/firestore";
import { type ReactNode, useEffect, useState } from "react";
import { auth, db } from "@/firebaseClient.ts";
import AuthContext from "@/components/Auth/AuthContext";
import { getCurrentUser } from "@/data/users.ts";
import type { User } from "@/../shared/types.ts";

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    // Function to clean up Firestore snapshot listener, if it exists
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clean up previous snapshot listener if it exists
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }

      if (firebaseUser !== null) {
        // User is signed in
        localStorage.setItem("token", await firebaseUser.getIdToken());
        setUser(await getCurrentUser());

        // Set up Firestore listener on user document to detect non-auth changes (e.g. displayName update)
        const userDocRef = doc(db, "users", firebaseUser.uid);
        unsubscribeSnapshot = onSnapshot(userDocRef, (snap) => {
          // Whenever the Firestore document changes, fetch updated user data
          setUser(snap.data() as User);
        });
      } else {
        // User is signed out

        localStorage.removeItem("token");
        setUser(null);
      }
    });

    // On unmount, clean up both listeners
    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  return <AuthContext value={[user, setUser]}>{children}</AuthContext>;
}
