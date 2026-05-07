//NOTES//////////////////////////////////////////
//is this doing the logic of categorical display? probably
// most popular -> pull top 11
// picks for you -> call algoirthm function
// newest releases ->
// something outside your box -> opposite alg function
//IMPORTS/////////////////////////////////////////

import type { FC } from "react";
import type { CarouselCardData } from "@/types/types.ts";
import { useState, useEffect } from "react";
import CarouselCard from "./CarouselCard.tsx";

//UI IMPORTS//////////////////////////////////////
import { Carousel, HStack, IconButton, Span, Spinner, Center } from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { useAxiosClient } from "@/hooks.ts";

//-------------------------------------------------//

interface Props {
  category: string; // most popular, picks for you, newest releases, outside the box; calls appropriate data functions based on this
  //cards will be made in the carousel
  // cards: React.ReactNode[]; // array of carousel cards
  username?: string; //optional prop as only the recommended algorithms need the username
  onLoaded?: (category: string) => void;
}

const CarouselRow: FC<Props> = ({ category, username, onLoaded }) => {
  const [cards, setCards] = useState<CarouselCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");

  const axiosClient = useAxiosClient();

  //REMOVE FOR TESTING
  //GENERATE
  // const testCards: CarouselCardData[] = [
  //   {
  //     id: "elden-ring",
  //     gameImg:
  //       "https://www.creativefabrica.com/wp-content/uploads/2023/08/06/Game-Background-Graphics-76306020-1.jpg",
  //     gameName: "Elden Ring",
  //     rating: 4.7,
  //     platforms: [
  //       { platform: { id: 1, name: "PC", slug: "pc" } },
  //       { platform: { id: 2, name: "PlayStation 5", slug: "playstation5" } },
  //       { platform: { id: 3, name: "Xbox Series X", slug: "xbox-series-x" } },
  //     ],
  //   },
  //   {
  //     id: "baldurs-gate-3",
  //     gameImg:
  //       "https://www.creativefabrica.com/wp-content/uploads/2023/08/06/Game-Background-Graphics-76306020-1.jpg",
  //     gameName: "Baldur's Gate 3",
  //     rating: 4.8,
  //     platforms: [
  //       { platform: { id: 1, name: "PC", slug: "pc" } },
  //       { platform: { id: 2, name: "PlayStation 5", slug: "playstation5" } },
  //     ],
  //   },
  //   {
  //     id: "cyberpunk-2077",
  //     gameImg:
  //       "https://www.creativefabrica.com/wp-content/uploads/2023/08/06/Game-Background-Graphics-76306020-1.jpg",
  //     gameName: "Cyberpunk 2077",
  //     rating: 2.9,
  //     platforms: [
  //       { platform: { id: 1, name: "PC", slug: "pc" } },
  //       { platform: { id: 2, name: "PlayStation 5", slug: "playstation5" } },
  //       { platform: { id: 3, name: "Xbox Series X", slug: "xbox-series-x" } },
  //     ],
  //   },
  //   {
  //     id: "the-legend-of-zelda-tears-of-the-kingdom",
  //     gameImg:
  //       "https://www.creativefabrica.com/wp-content/uploads/2023/08/06/Game-Background-Graphics-76306020-1.jpg",
  //     gameName: "The Legend of Zelda: Tears of the Kingdom",
  //     rating: 3.6,
  //     platforms: [
  //       {
  //         platform: { id: 4, name: "Nintendo Switch", slug: "nintendo-switch" },
  //       },
  //     ],
  //   },
  //   {
  //     id: "hades",
  //     gameImg:
  //       "https://www.creativefabrica.com/wp-content/uploads/2023/08/06/Game-Background-Graphics-76306020-1.jpg",
  //     gameName: "Hades",
  //     rating: 4.2,
  //     platforms: [
  //       { platform: { id: 1, name: "PC", slug: "pc" } },
  //       {
  //         platform: { id: 4, name: "Nintendo Switch", slug: "nintendo-switch" },
  //       },
  //       { platform: { id: 5, name: "PlayStation 4", slug: "playstation4" } },
  //     ],
  //   },
  //   {
  //     id: "red-dead-redemption-2",
  //     gameImg:
  //       "https://www.creativefabrica.com/wp-content/uploads/2023/08/06/Game-Background-Graphics-76306020-1.jpg",
  //     gameName: "Red Dead Redemption 2",
  //     rating: 1.5,
  //     platforms: [
  //       { platform: { id: 1, name: "PC", slug: "pc" } },
  //       { platform: { id: 6, name: "Xbox One", slug: "xbox-one" } },
  //       { platform: { id: 5, name: "PlayStation 4", slug: "playstation4" } },
  //     ],
  //   },
  //   {
  //     id: "stardew-valley",
  //     gameImg:
  //       "https://www.creativefabrica.com/wp-content/uploads/2023/08/06/Game-Background-Graphics-76306020-1.jpg",
  //     gameName: "Stardew Valley",
  //     rating: 2.1,
  //     platforms: [
  //       { platform: { id: 1, name: "PC", slug: "pc" } },
  //       {
  //         platform: { id: 4, name: "Nintendo Switch", slug: "nintendo-switch" },
  //       },
  //       { platform: { id: 7, name: "Mobile", slug: "ios" } },
  //     ],
  //   },
  //   {
  //     id: "god-of-war-ragnarok",
  //     gameImg:
  //       "https://www.creativefabrica.com/wp-content/uploads/2023/08/06/Game-Background-Graphics-76306020-1.jpg",
  //     gameName: "God of War Ragnarök",
  //     rating: 3.4,
  //     platforms: [
  //       { platform: { id: 2, name: "PlayStation 5", slug: "playstation5" } },
  //       { platform: { id: 5, name: "PlayStation 4", slug: "playstation4" } },
  //     ],
  //   },
  // ];

  useEffect(() => {
    // REMOVE FOR TESTING
    //setCards(testCards);
    setLoading(true);

    async function loadGames() {
      if (category) {
        if (category == "popular") {
          //get popular cards
          try {
            let { data } = await axiosClient.get("/api/games/popular");
            //console.log("results", data.results);
            setCards(data.results);
            // console.log("Popular games: ", data.results);
            // CALCULATE RATING
          } catch (e) {
            console.error(e);
          }

          setTitle("Most Popular");
        } else if (category == "recommended") {
          if (!username) {
            console.log("No username found for recommended carousel");
            return;
          }

          try {
            let { data } = await axiosClient.get(`/api/games/recommended/${username}`, {
              params: { t: Date.now() }, // fuck cache
            });
            setCards(data.results);
          } catch (e) {
            console.log(e);
          }

          setTitle("Recommended");
        } else if (category == "outside") {
          if (!username) {
            console.log("No username found for outside carousel");
            return;
          }

          try {
            let { data } = await axiosClient.get(`/api/games/outside/${username}`, {
              params: { t: Date.now() },
            });
            setCards(data.results);
          } catch (e) {
            console.log(e);
          }

          setTitle("Outside");
        } else if (category == "newest") {
          //get newest games
          try {
            let { data } = await axiosClient.get("/api/games/newest");
            //console.log("results", data.results);
            setCards(data.results);
            // CALCULATE RATING
          } catch (e) {
            console.error(e);
          }
          setTitle("Newest Releases");
          // CALCULATE RATING
        } else if (category == "outside") {
          //get cards NOT recommmended for them
          setTitle("Outside Your Box");
          // CALCULATE RATING
        }
      }

      setLoading(false);
      onLoaded?.(category);
    }

    loadGames();
  }, [category, username]);

  return (
    <div>
      {loading ? (
        <Center minH="200px">
          <Spinner size="lg" />
        </Center>
      ) : (
        <Carousel.Root
          mx="4"
          slideCount={cards.length}
          slidesPerPage={4}
          gap="4"
        >
          <HStack justify="space-between">
            <Span fontWeight="medium">{title}</Span>
            <HStack>
              <Carousel.PrevTrigger asChild>
                <IconButton
                  size="lg"
                  variant="subtle"
                >
                  <LuChevronLeft />
                </IconButton>
              </Carousel.PrevTrigger>
              <Carousel.NextTrigger asChild>
                <IconButton
                  size="lg"
                  variant="subtle"
                >
                  <LuChevronRight />
                </IconButton>
              </Carousel.NextTrigger>
            </HStack>
          </HStack>
          <Carousel.ItemGroup>
            {cards.map((card, index) => (
              <Carousel.Item
                key={card.id}
                index={index}
              >
                {/* send what if theres no platforms? undefined or []; react ignores undefined props */}
                <CarouselCard
                  id={card.id}
                  background_image={card.background_image}
                  name={card.name}
                  rating={card.rating}
                  platforms={card.platforms}
                  loading={loading}
                />
              </Carousel.Item>
            ))}
          </Carousel.ItemGroup>
        </Carousel.Root>
      )}
    </div>
  );
};

export default CarouselRow;
