//IMPORTS////////////////////////////////////////
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseClient";
import type { User } from "firebase/auth";
//UI IMPORTS/////////////////////////////////////
import toast from "react-hot-toast";
import Carousel from "../components/Carousel/Carousel";
import Navbar from "@/components/Navbar";

function MainFeed() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/login");
        return;
      }

      setUser(firebaseUser);

      const snap = await getDoc(doc(db, "users", firebaseUser.uid));

      if (snap.exists()) {
        const data = snap.data();
        setUsername(data.username);
      } else {
        setUsername("User");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logout successful!");
      navigate("/login");
    } catch (e: any) {
      toast.error(e.message || "Logout failed.");
    }
  };

  if (!user) return null;

  return (
    <div>
      <Navbar username={username}></Navbar>
      <h1>Hello, {username}!</h1>
      <button onClick={handleLogout}>Log Out</button>
      <Carousel category="popular"/>
      <Carousel category="newest"/>
    </div>
  );
}

export default MainFeed;
