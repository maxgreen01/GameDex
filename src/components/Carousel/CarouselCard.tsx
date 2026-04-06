//NOTES//////////////////////////////////////////
//a see more card
//rating is calculating in house or passed? assumed passed in
//is id int (from api) or slug string
//most common platforms done only
//rating rounded down

//IMPORTS/////////////////////////////////////////
import type { FC } from "react";
import Rating from "../Rating";
import {
  FaWindows,
  FaPlaystation,
  FaXbox,
  FaApple,
  FaLinux,
} from "react-icons/fa";
import { BsNintendoSwitch } from "react-icons/bs";
import { IoLogoAndroid } from "react-icons/io";
import { MdOutlinePhoneIphone } from "react-icons/md";
import type { IconType } from "react-icons";

//UI IMPORTS//////////////////////////////////////
import { Box, Card, Image, Flex } from "@chakra-ui/react";

//API DATA NEEDED
// componentVar = apiVar           : typeReturned
// id           = id               : int
//              || slug            : string
// gameImg      = background_image : string
// platforms    = platforms        : [Objects]

// ex.
// {
//   "platforms": [
//     {
//       "platform": {
//         "id": 4,
//         "name": "PC",
//         "slug": "pc" //using this
//       }
//     },
//     {
//       "platform": {
//         "id": 187,
//         "name": "PlayStation 5",
//         "slug": "playstation5"
//       }
//     }
//   ]
// }
//-------------------------------------------------//

interface Platform {
  platform: {
    id: number;
    name: string;
    slug: string;
  };
}

interface Props {
  // Game Card
  id: string; //assuming slug (see notes)
  gameImg?: string; //if seeMore, this isn't given, alternatively the game may not have an img
  gameName: string; //same as above
  rating: Number; //CALC HERE OR PASSED IN?
  platforms?: Platform[]; //platforms this game is available on
}

const allPlatforms: Record<string, IconType> = {
  pc: FaWindows,
  playstation4: FaPlaystation,
  playstation5: FaPlaystation,
  "xbox-one": FaXbox,
  "xbox-series-x": FaXbox,
  xbox360: FaXbox,
  "nintendo-switch": BsNintendoSwitch,
  ios: MdOutlinePhoneIphone,
  android: IoLogoAndroid,
  macos: FaApple,
  linux: FaLinux,
};

const CarouselCard: FC<Props> = ({
  id,
  gameImg,
  gameName,
  rating,
  platforms,
}) => {
  let showPlatforms = platforms?.filter((p) => {
    return (
      p?.platform?.slug && Object.keys(allPlatforms).includes(p.platform.slug)
    );
  });

  let compPlatforms = showPlatforms?.map((p) => {
    return {
      slug: p.platform.slug,
      Icon: allPlatforms[p.platform.slug],
    };
  });

  return (
    <div key={id}>
      <Card.Root size="sm" maxW="sm" overflow="hidden" variant="outline">
        {gameImg ? (
          <Image src={gameImg} alt="Green double couch with wooden legs" />
        ) : (
          <Box w="100%" h="150px" bg="gray.700" />
        )}
        <Card.Body gap="2">
          <Card.Title>{gameName}</Card.Title>
        </Card.Body>
        <Card.Footer gap="2">
          <Flex justify="space-between" w="100%">
            <Rating
              readOnly={true}
              value={Math.round(Number(rating) * 2) / 2}
            />
            <Flex>
              {compPlatforms?.map(({ slug, Icon }) => (
                <Icon key={slug} style={{ marginLeft: "4px" }} />
              ))}
            </Flex>
          </Flex>
        </Card.Footer>
      </Card.Root>
    </div>
  );
};

export default CarouselCard;
