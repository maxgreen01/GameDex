//NOTES//////////////////////////////////////////
//a see more card
//rating is calculating in house or passed? assumed passed in
//is id int (from api) or slug string
//most common platforms done only
//rating rounded down
// called from carousel
//use asChild in skeleton??
//IMPORTS/////////////////////////////////////////
import type { FC } from "react";
import { useState } from "react";
import type { Platform, CarouselCardData } from "../../types/games.ts";
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
import { Box, Card, Image, Flex, Skeleton } from "@chakra-ui/react";

//API DATA NEEDED
// componentVar = apiVar           : typeReturned
// id           = id               : int
//              || slug            : string
// gameImg      = background_image : string
// platforms    = platforms        : [Objects]
// gameName     = name             : string

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

interface Props extends CarouselCardData {
  // Game Card
  loading?: boolean;
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
  loading = false,
}) => {
  let showPlatforms = platforms?.filter((p) => {
    return Object.keys(allPlatforms).includes(p.platform.slug);
  });

  let compPlatforms = showPlatforms?.map((p) => ({
    slug: p.platform.slug,
    Icon: allPlatforms[p.platform.slug],
  }));

  return (
    <Skeleton loading={loading} variant="shine">
      <div key={id}>
        <Card.Root
          size="sm"
          maxW="sm"
          overflow="hidden"
          variant="outline"
          h="100%"
          display="flex"
          flexDirection="column"
        >
          {gameImg ? (
            <Image src={gameImg} alt={`Game image for ${gameName}`} />
          ) : (
            <Box w="100%" h="150px" bg="gray.700" />
          )}
          <Card.Body flex="1" gap="2">
            {/*lineClamp={2} to card title to cut off long titles*/} 
            <Card.Title   minH="12">{gameName}</Card.Title>
          </Card.Body>
          <Card.Footer mt="auto" gap="2">
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
    </Skeleton>
  );
};

export default CarouselCard;
