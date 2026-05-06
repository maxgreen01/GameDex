import { onAuthStateChanged } from "firebase/auth";
import { type ReactNode, useEffect, useState } from "react";
import { auth } from "@/firebaseClient.ts";
import AuthContext from "@/components/Auth/AuthContext";
import { getCurrentUser } from "@/data/users.ts";
import type { User } from "@/../shared/types.ts";

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser !== null) {
        localStorage.setItem("token", await firebaseUser.getIdToken());
        setUser(await getCurrentUser());
      } else {
        localStorage.removeItem("token");
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return <AuthContext value={[user, setUser]}>{children}</AuthContext>;
}
