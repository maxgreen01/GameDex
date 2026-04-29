//PAGE IMPORTS//////////////////////////////
import Profile from "./pages/Profile";
import "./App.css";

//OTHER IMPORTS/////////////////////////////

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import NotFoundPage from "./pages/NotFoundPage";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import Home from "./pages/Home";
import MainFeed from "./pages/MainFeed";
import GameDetails from "./components/GameDetails";
import SearchResults from "./pages/SearchResults";

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={<Login />}
          />
          <Route
            path="/signup"
            element={<Signup />}
          />
          <Route
            path="/"
            element={<Home />}
          />
          <Route
            path="/mainfeed/:username"
            element={<MainFeed />}
          />
          <Route
            path="/profile/:username"
            element={<Profile />}
          />
          <Route
            path="/games/:id"
            element={<GameDetails />}
          />
          <Route
            path="/search"
            element={<SearchResults />}
          />
          <Route
            path="*"
            element={<NotFoundPage />}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
