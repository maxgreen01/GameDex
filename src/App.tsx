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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "@/components/Auth/AuthProvider.tsx";

function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <AuthProvider>
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
              path="/mainfeed"
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
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
