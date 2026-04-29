/*
NOTES: THE CARDS IN THIS PAGE STILL NEED TO BECOME CLICKABLE. THIS CAN BE DONE AFTER WE ADD A CARD DETAIL PAGE.
*/

import type { FC } from "react";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import type { CarouselCardData } from "../types/types.ts";
import CarouselCard from "@/components/Carousel/CarouselCard";
import { Box, Heading, SimpleGrid, Spinner, Center, Text } from "@chakra-ui/react";
import Navbar from "@/components/Navbar";
import { onAuthStateChanged, type User } from "@firebase/auth";
import { auth, db } from "../firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import SearchBar from "@/components/SearchBar";

interface SearchResultsProps {}

const SearchResults: FC<SearchResultsProps> = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const [results, setResults] = useState<CarouselCardData[]>([]); //to hold the results from the search query
  const [loading, setLoading] = useState(true); //loading state
  const [error, setError] = useState<string | null>(null); //error state

  //To obtain the username prop to pass to Navigate
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string>("");

  const navigate = useNavigate();

  //Verifying Auth Use Effect
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

  //Fires whenever the searchQuery term changes. Grabs data from /search route, and sets results.
  useEffect(() => {
    if (!searchQuery) {
      navigate("/");
      return;
    }

    async function performSearch() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get("http://localhost:3000/api/games/search", {
          params: { search: searchQuery },
        });
        setResults(data.results || []);
      } catch (e) {
        console.error(e);
        setError("Failed to fetch search results");
      } finally {
        setLoading(false);
      }
    }

    performSearch();
  }, [searchQuery]);

  //The HTML that is rendered, including navbar, searchbar, and results. Spinner is included if loading is true.
  return (
    <>
      <Navbar
        username={username}
        profilePage={false}
      />
      <Box p="8">
        <Heading
          mb="8"
          size="lg"
        >
          Search Results for "{searchQuery}"
        </Heading>

        <Box mb="5">
          <SearchBar></SearchBar>
        </Box>

        {loading ? (
          <Center minH="400px">
            <Spinner size="lg" />
          </Center>
        ) : error ? (
          <Center minH="400px">
            <Text color="red.500">{error}</Text>
          </Center>
        ) : results.length === 0 ? (
          <Center minH="400px">
            <Text
              fontSize="lg"
              color="gray.500"
            >
              No games found. Try a different search.
            </Text>
          </Center>
        ) : (
          <SimpleGrid
            columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
            gap="6"
          >
            {" "}
            {/*Grid structure to display results, using CarouselCard*/}
            {results.map((game) => (
              <CarouselCard
                key={game.id}
                id={game.id}
                background_image={game.background_image}
                name={game.name}
                rating={game.rating}
                platforms={game.platforms}
                loading={false}
              />
            ))}
          </SimpleGrid>
        )}
      </Box>
    </>
  );
};

export default SearchResults;
