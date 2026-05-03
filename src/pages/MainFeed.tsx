//IMPORTS////////////////////////////////////////
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseClient";
import type { User } from "firebase/auth";
//UI IMPORTS/////////////////////////////////////
import Carousel from "../components/Carousel/Carousel";
import Navbar from "@/components/Navbar";
import SearchBar from "../components/SearchBar";
import { Center, Spinner } from "@chakra-ui/react";

function MainFeed() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string>("");
  const [loadedCarousels, setLoadedCarousels] = useState(0);

  const totalCarousels = username ? 3 : 2;

  function handleCarouselLoaded() {
    setLoadedCarousels((prev) => prev + 1);
  }

  const allCarouselsLoaded = loadedCarousels >= totalCarousels;

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

  if (!user) return null;

  return (
    <div>
      <Navbar
        profilePage={false}
        username={username}
      ></Navbar>
      {/* <h1>Welcome, {username}!</h1> */}
      {/* <button onClick={handleLogout}>Log Out</button> */}
      <SearchBar></SearchBar>
      <Carousel category="popular" />
      <Carousel category="newest" />

      {/*  Only render once username is loaded to avoid making 
      an API call with an empty/undefined username */}
      {username && (
        <Carousel
          category="recommended"
          username={username}
        />
      )}
      {username && (
        <Carousel
          category="outside"
          username={username}
        />
      )}
    </div>
  );
}

export default MainFeed;
