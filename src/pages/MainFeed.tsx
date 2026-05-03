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
  const [loadedCarousels, setLoadedCarousels] = useState<string[]>([]);

  function handleCarouselLoaded(category: string) {
    setLoadedCarousels((prev) => {
      if (prev.includes(category)) return prev;
      return [...prev, category];
    });
  }

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

  let expectedCarousels = username ? 4 : 2;
  let allCarouselsLoaded = loadedCarousels.length >= expectedCarousels;

  return (
    <div>
      <Navbar
        profilePage={false}
        username={username}
      ></Navbar>
      {/* <h1>Welcome, {username}!</h1> */}
      {/* <button onClick={handleLogout}>Log Out</button> */}
      <SearchBar></SearchBar>

      {/* SPINNER */}
      {!allCarouselsLoaded && (
        <Center minH="400px">
          <Spinner size="xl" />
        </Center>
      )}

      {/* Hides everything or show everything. ALL OR NOTHING */}
      <div style={{ display: allCarouselsLoaded ? "block" : "none" }}>
        <Carousel
          category="popular"
          onLoaded={handleCarouselLoaded}
        />
        <Carousel
          category="newest"
          onLoaded={handleCarouselLoaded}
        />

        {/*  Only render once username is loaded to avoid making 
      an API call with an empty/undefined username */}
        {username && (
          <Carousel
            category="recommended"
            username={username}
            onLoaded={handleCarouselLoaded}
          />
        )}
        {username && (
          <Carousel
            category="outside"
            username={username}
            onLoaded={handleCarouselLoaded}
          />
        )}
      </div>
    </div>
  );
}

export default MainFeed;
