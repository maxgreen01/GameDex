//IMPORTS////////////////////////////////////////
import { useContext } from "react";
import { Navigate } from "react-router-dom";
//UI IMPORTS/////////////////////////////////////
import AuthContext from "../components/Auth/AuthContext";
import Carousel from "../components/Carousel/Carousel";
import Navbar from "@/components/Navbar";
import SearchBar from "../components/SearchBar";

function MainFeed() {
  const [user] = useContext(AuthContext);

  if (user === null) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return (
    <div>
      <Navbar />
      {/* <h1>Welcome, {username}!</h1> */}
      {/* <button onClick={handleLogout}>Log Out</button> */}
      <SearchBar></SearchBar>
      <Carousel category="popular" />
      <Carousel category="newest" />
    </div>
  );
}

export default MainFeed;
