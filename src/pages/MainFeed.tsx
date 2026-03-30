import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";

export default function MainFeed() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        setUsername(snap.data().username);
      } else {
        setUsername(user.email || "");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logout successful!")
      navigate("/login");
    }
    catch(e: any) {
      toast.error(e.message || "Logout failed.")
    }
  };

  return (
    <div>
      <h1>Welcome {username}!</h1>
      <button onClick={handleLogout}>Sign Out</button>
    </div>
  );
}