/*
NOTES: THE CARDS IN THIS PAGE STILL NEED TO BECOME CLICKABLE. THIS CAN BE DONE AFTER WE ADD A CARD DETAIL PAGE.
*/

import { type FC, useContext, useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import type { CarouselCardData } from "../types/types.ts";
import CarouselCard from "@/components/Carousel/CarouselCard";
import { Box, Heading, SimpleGrid, Spinner, Center, Text, Accordion, Span, VStack, StackSeparator, Flex } from "@chakra-ui/react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import { useAxiosClient } from "@/hooks.ts";
import type { ProfileData } from "../../shared/types.ts";
import ManageFriendRequestButton from "@/components/Profile/ManageFriendRequestButton.tsx";
import AuthContext from "@/components/Auth/AuthContext.tsx";
import { useQueryClient } from "@tanstack/react-query";

interface SearchResultsProps {}

const SearchResults: FC<SearchResultsProps> = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const [userResults, setUserResults] = useState<ProfileData[]>([]); //to hold the user results from the search query
  const [gameResults, setGameResults] = useState<CarouselCardData[]>([]); //to hold the results from the search query
  const [loading, setLoading] = useState(true); //loading state
  const [error, setError] = useState<string | null>(null); //error state

  const axiosClient = useAxiosClient();
  const queryClient = useQueryClient(); //todo might need to load user data in a useeffect
  const [currentUser] = useContext(AuthContext);

  const navigate = useNavigate();

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
        const users = await axiosClient.get("/api/search/users", {
          params: { search: searchQuery },
        });
        setUserResults(users.data || []);

        const { data } = await axiosClient.get("/api/games/search", {
          params: { search: searchQuery },
        });
        setGameResults(data.results || []);
      } catch (e) {
        console.error(e);
        setError("Failed to fetch search results");
      } finally {
        setLoading(false);
      }
    }

    performSearch();
  }, [searchQuery]);

  const results = [
    {
      title: "Users",
      value: "users",
      data: userResults,
      emptyText: "No users found. Try a different search.",
      mainDisplayComponent: (
        <VStack
          gap={2}
          mt={2}
          mb={4}
        >
          {userResults.map((user) => {
            const otherUser = user.username;
            return (
              <Flex
                key={otherUser}
                direction={"row"}
                justify="space-between"
                align="center"
                width="80%"
              >
                <Link to={`/profile/${otherUser}`}>{otherUser}</Link>

                {currentUser && (
                  <ManageFriendRequestButton
                    currentUser={currentUser}
                    otherUser={otherUser}
                    axiosClient={axiosClient}
                    queryClient={queryClient}
                  />
                )}
              </Flex>
            );
          })}
        </VStack>
      ),
    },
    {
      title: "Games",
      value: "games",
      data: gameResults,
      emptyText: "No games found. Try a different search.",
      mainDisplayComponent: (
        <SimpleGrid
          columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
          gap="6"
        >
          {/*Grid structure to display results, using CarouselCard*/}
          {gameResults.map((game) => (
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
      ),
    },
  ];

  //The HTML that is rendered, including navbar, searchbar, and results. Spinner is included if loading is true.
  return (
    <>
      <Navbar />
      <Box p="8">
        <Heading
          mb="8"
          size="lg"
        >
          Search Results for "{searchQuery}"
        </Heading>

        <Box mb="5">
          <SearchBar existingInput={searchQuery}></SearchBar>
        </Box>

        {loading ? (
          <Center minH="400px">
            <Spinner size="lg" />
          </Center>
        ) : error ? (
          <Center minH="400px">
            <Text color="red.500">{error}</Text>
          </Center>
        ) : (
          <Accordion.Root
            multiple
            defaultValue={["games", "users"]}
            variant="outline"
            size="lg"
          >
            {/* create a section for each result type */}
            {results.map((item) => (
              <Accordion.Item
                key={item.value}
                value={item.value}
                mb="8"
              >
                <Accordion.ItemTrigger>
                  <Span flex="1">{item.title}</Span>
                  <Accordion.ItemIndicator />
                </Accordion.ItemTrigger>
                <Accordion.ItemContent>
                  <Accordion.ItemBody>
                    {item.data?.length === 0 ? (
                      <Center minH="200px">
                        <Text
                          fontSize="lg"
                          color="gray.500"
                        >
                          {item.emptyText}
                        </Text>
                      </Center>
                    ) : (
                      // show the actual data
                      item.mainDisplayComponent
                    )}
                  </Accordion.ItemBody>
                </Accordion.ItemContent>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        )}
      </Box>
    </>
  );
};

export default SearchResults;
