//NOTES//////////////////////////////////////////
//things to be done
//  - calc rating and add in useEffect
//  - get description for games
//  - add "if loading" logic
//  - how often do we reload comments?
//  - add to collection button
// review data would come from
// a) the signed in user (user info to put their review at the top and get their friends reviews below it)
// b) the param id (to get game info )
//Database needs:
//Need to delete review (but from the parents of this, reviewStack i think or gameDetails)
//Need to fetch reviews to send
//need to fetch current user info

//Review returned need format
// Review = {
//   reviewId: string
//   username: string
//   displayName: string
//   rating: number
//   gameId: string
//   comment: string
// }
//IMPORTS/////////////////////////////////////////
import type { FC } from "react";
import { allPlatforms } from "../types/types.ts";
import type { ReviewType } from "../types/types.ts";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import type { Platform, userDetails } from "../types/types.ts";
import getUserDetails from "@/services/users.ts";
import { useNavigate } from "react-router-dom";
//UI IMPORTS//////////////////////////////////////
import { Box, Flex, Image, ScrollArea, Card, Heading, Text } from "@chakra-ui/react";
import Rating from "./Rating.tsx";
import Review from "./Reviews/Review.tsx";
import AddReviewForm from "./Reviews/AddReviewForm.tsx";
//-------------------------------------------------//

export interface Props {
  //add reviews maybe
}

const GameDetails: FC<Props> = ({}) => {
  const [loading, setLoading] = useState(true);
  // make into the default icon
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [name, setName] = useState(null);
  const [rating, setRating] = useState(0);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [description, setDescription] = useState("");
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [user, setUser] = useState<userDetails | null>(null);
  const [userReview, setUserReview] = useState<ReviewType | null>(null);
  //const [showAddReviewButton, setShowAddReviewButton] = useState<boolean>(false);

  const { id } = useParams();
  let navigate = useNavigate();

  //fetchingGame
  useEffect(() => {
    setLoading(true);

    async function loadGame() {
      try {
        let { data } = await axios.get(`http://localhost:3000/api/games/${id}`);
        console.log("Data: ", data);

        setBackgroundImage(data.background_image);
        setName(data.name);
        // CALCULATE RATING
        setRating(4);
        setPlatforms(data.platforms);
        setDescription(data.description);
      } catch (e) {
        console.error(e);
      }
    }

    async function getReviews() {
      try {
        let userExists = await getUserDetails();
        if (!userExists) {
          navigate("/login");
          return;
        }

        setUser(userExists);

        let { data: gameReviewsExceptCurrUser } = await axios.get(`http://localhost:3000/api/reviews/game/${id}/excluding/${userExists.username}`);
        setReviews(gameReviewsExceptCurrUser);

        let { data: currentUserReview } = await axios.get(`http://localhost:3000/api/reviews/game/${id}/user/${userExists.username}`);
        if (currentUserReview) {
          setUserReview(currentUserReview);
        }

        setLoading(false);
      } catch (e) {
        console.error(e);
      }
    }

    loadGame();
    getReviews();
  }, [id]);

  //if user changes, deletes or adds a review
  useEffect(() => {
    //adds
    //changes
    //deletes
  }, [userReview]);

  //only gets most common platforms from given ones
  let showPlatforms = platforms?.filter((p) => {
    return p?.platform?.slug && Object.keys(allPlatforms).includes(p.platform.slug);
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

  //add loading and if user
  return (
    <div>
      <Flex h="100vh">
        {/* game details */}
        <Box
          w="50%"
          overflowY={"auto"}
        >
          <ScrollArea.Root
            height="100%"
            maxW="lg"
          >
            <ScrollArea.Viewport>
              <ScrollArea.Content
                spaceY="4"
                textStyle="sm"
              >
                {/* <Image
                  src={props.background_image}
                  alt={`Game image for ${props.name}`}
                  w="100%"
                  h="100%"
                  objectFit="cover"
                ></Image> */}

                <Card.Root
                  //   size="sm"
                  h="100vh"
                  maxW="100%"
                  overflowY={"auto"}
                  variant="outline"
                  display="flex"
                  flexDirection="column"
                  p={6}
                >
                  {backgroundImage ? (
                    <Box
                      w="100%"
                      h="50%"
                      overflow="hidden"
                      flexShrink={0}
                    >
                      <Image
                        src={backgroundImage}
                        alt={`Game image for ${name}`}
                        w="100%"
                        h="100%"
                        objectFit="cover"
                      />
                    </Box>
                  ) : (
                    <Box
                      w="100%"
                      h="180px"
                      bg="gray.700"
                      flexShrink={0}
                    />
                  )}
                  <Card.Body
                    flex="1"
                    gap="2"
                    w="100%"
                  >
                    {/*lineClamp={2} to card title to cut off long titles*/}
                    {/*SHOULD I DO DYNAMIC SIZING -> CAROUSELS  MAY BE DIFF SIZES OR CUT OFFS  */}
                    <Heading>{name}</Heading>
                    <Rating
                      readOnly={true}
                      value={Math.round(Number(rating) * 2) / 2}
                      starSize="lg"
                    />
                    <Flex>
                      {compPlatforms?.map(({ slug, Icon }) => (
                        <Icon
                          key={slug}
                          style={{ marginLeft: "4px", height: "40px" }}
                        />
                      ))}
                    </Flex>
                    <Card.Description>{description}</Card.Description>
                  </Card.Body>
                  <Card.Footer
                    mt="auto"
                    gap="2"
                  ></Card.Footer>
                </Card.Root>
              </ScrollArea.Content>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar>
              <ScrollArea.Thumb />
            </ScrollArea.Scrollbar>
            <ScrollArea.Corner />
          </ScrollArea.Root>
        </Box>
        {/* reviews */}
        <Box
          w="50%"
          overflowY={"auto"}
        >
          <ScrollArea.Root
            height="100%"
            maxW="lg"
          >
            <ScrollArea.Viewport>
              <ScrollArea.Content textStyle="sm">
                {userReview ? (
                  <Review
                    reviewId={userReview._id ?? ""}
                    rating={userReview.rating}
                    profilePage={false}
                    usersReview={true}
                    displayName={user?.displayName}
                    username={user?.username}
                    comment={userReview.text}
                    setUserReview={setUserReview}
                  />
                ) : (
                  <AddReviewForm
                    // hope this doesnt error
                    gameId={id ?? ""}
                    username={user?.username ?? "Unknown User"}
                    displayName={user?.displayName ?? "Unknown User"}
                    setUserReview={setUserReview}
                  />
                )}

                {reviews ? (
                  reviews.map((review) => (
                    <Review
                      reviewId={review._id ?? ""}
                      rating={review.rating}
                      profilePage={false}
                      usersReview={false}
                      displayName={review.displayName}
                      username={review.userId}
                      comment={review.text}
                    />
                  ))
                ) : (
                  <Text>No reviews yet. Be the first to write one!</Text>
                )}
              </ScrollArea.Content>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar>
              <ScrollArea.Thumb />
            </ScrollArea.Scrollbar>
            <ScrollArea.Corner />
          </ScrollArea.Root>
        </Box>
      </Flex>
    </div>
  );
};

export default GameDetails;
