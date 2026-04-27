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
import type { CarouselCardData } from "../../types/types.ts";
import Rating from "../Rating";
import { allPlatforms } from "../../types/types.ts";
import { Link } from "react-router-dom";
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

const CarouselCard: FC<Props> = ({
  id,
  background_image,
  name,
  rating,
  platforms,
  loading = false,
}) => {
  //only gets most common platforms from given ones
  let showPlatforms = platforms?.filter((p) => {
    return (
      p?.platform?.slug && Object.keys(allPlatforms).includes(p.platform.slug)
    );
  });

  //prevents repeating icons
  const seenPlatformIcons = new Set();

  //matches given platforms with their icon
  let compPlatforms = showPlatforms
    ?.map((p) => {
      return {
        slug: p.platform.slug,
        Icon: allPlatforms[p.platform.slug],
      };
    })
    .filter((slugIconPair) => {
      if (seenPlatformIcons.has(slugIconPair.Icon)) return false;
      seenPlatformIcons.add(slugIconPair.Icon);
      return true;
    });

  return (
    <Skeleton loading={loading} variant="shine" height="320px">
      <Link to={`/games/${id}`}>
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
            {background_image ? (
              <Box w="100%" h="180px" overflow="hidden" flexShrink={0}>
                <Image
                  src={background_image}
                  alt={`Game image for ${name}`}
                  w="100%"
                  h="100%"
                  objectFit="cover"
                />
              </Box>
            ) : (
              <Box w="100%" h="180px" bg="gray.700" flexShrink={0} />
            )}
            <Card.Body flex="1" gap="2">
              {/*lineClamp={2} to card title to cut off long titles*/}
              {/*SHOULD I DO DYNAMIC SIZING -> CAROUSELS  MAY BE DIFF SIZES OR CUT OFFS  */}
              <Card.Title lineClamp={2} minH="12">
                {name}
              </Card.Title>
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
      </Link>
    </Skeleton>
  );
};

export default CarouselCard;
