//NOTES//////////////////////////////////////////
//is this doing the logic of categorical display? probably
// most popular -> pull top 11
// picks for you -> call algoirthm function
// newest releases ->
// something outside your box -> opposite alg function
//IMPORTS/////////////////////////////////////////
import { useEffect, useState, type FC } from "react";
import axios from "axios";
import CarouselCard from "./CarouselCard";

//UI IMPORTS//////////////////////////////////////
import {} from "@chakra-ui/react";

//-------------------------------------------------//

interface Props {}

const Carousel: FC<Props> = ({}) => {
  let [games, setGames] = useState<any[]>([]);

  useEffect(() => {
    async function loadGames() {
      try {
        let { data } = await axios.get(
          "http://localhost:3000/api/games/popular",
        );
        setGames(data.results);
      } catch (e) {
        console.error(e);
      }
    }

    loadGames();
  }, []);

  return (
    <div>
      {games.map((game) => {
        return (
          <CarouselCard
            key={game.id}
            id={String(game.slug)}
            gameImg={game.background_image}
            gameName={game.name}
            rating={game.rating || 0}
            platforms={game.platforms}
          />
        );
      })}
    </div>
  );
};

export default Carousel;
