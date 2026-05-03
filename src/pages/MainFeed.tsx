//IMPORTS////////////////////////////////////////
import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
//UI IMPORTS/////////////////////////////////////
import AuthContext from "../components/Auth/AuthContext";
import Carousel from "../components/Carousel/Carousel";
import Navbar from "@/components/Navbar";
import SearchBar from "../components/SearchBar";
import { Center, Spinner } from "@chakra-ui/react";

function MainFeed() {
  const [user] = useContext(AuthContext);

  const [loadedCarousels, setLoadedCarousels] = useState<string[]>([]);

  function handleCarouselLoaded(category: string) {
    setLoadedCarousels((prev) => {
      if (prev.includes(category)) return prev;
      return [...prev, category];
    });
  }

  if (user === null) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  let expectedCarousels = user ? 4 : 2;
  let allCarouselsLoaded = loadedCarousels.length >= expectedCarousels;

  return (
    <div>
      <Navbar />
      {/* <h1>Welcome, {user.username}!</h1> */}
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
        {user && (
          <Carousel
            category="recommended"
            username={user.username}
            onLoaded={handleCarouselLoaded}
          />
        )}
        {user && (
          <Carousel
            category="outside"
            username={user.username}
            onLoaded={handleCarouselLoaded}
          />
        )}
      </div>
    </div>
  );
}

export default MainFeed;
