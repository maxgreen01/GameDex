//IMPORTS////////////////////////////////////////
import type { FC } from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import type { User } from "firebase/auth";

//UI IMPORTS//////////////////////////////////////
import Navbar from "@/components/Navbar";

interface Props {
}

const Profile: FC<Props> = ({  }) => {
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

  return (
    <div>
      <Navbar username={username} profilePage={true}></Navbar>
      <p>{username}</p>
    </div>
  );
};

export default Profile;
