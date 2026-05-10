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
import { type FC, useContext, useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { type Platform, type ReviewType, type CollectionSummary, allPlatforms } from "../types/types.ts";
import { updateCollection } from "@/data/collections.ts";
//UI IMPORTS//////////////////////////////////////
import { Box, Flex, Image, ScrollArea, Dialog, Checkbox, Button, Portal, CloseButton, Card, Heading, Text, Spinner, Stack } from "@chakra-ui/react";
import Rating from "./Rating.tsx";
import AuthContext from "./Auth/AuthContext.tsx";
import Review from "./Reviews/Review.tsx";
import AddReviewForm from "./Reviews/AddReviewForm.tsx";
import { getCollectionsByUserTooAdd } from "@/data/collections.ts";
import toast from "react-hot-toast";
import Navbar from "./Navbar.tsx";
import { useAxiosClient } from "@/hooks.ts";
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
  const [userReview, setUserReview] = useState<ReviewType | null>(null);
  const [playlistsToAddTo, setPlaylistsToAddTo] = useState<CollectionSummary[]>([]);
  const [playlistLoading, setPlaylistLoading] = useState(false);
  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<{ id: string; name: string }[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  //const [showAddReviewButton, setShowAddReviewButton] = useState<boolean>(false);

  const { id } = useParams();
  const [user] = useContext(AuthContext);
  const axiosClient = useAxiosClient();

  //calculates the ratings according to the reviews.
  useEffect(() => {
    let allReviews = [...reviews];

    if (userReview) {
      allReviews.push(userReview);
    }

    if (allReviews.length === 0) {
      setRating(0);
      return;
    }

    let total = 0;

    for (let i = 0; i < allReviews.length; i++) {
      total += allReviews[i].rating;
    }

    let avg = total / allReviews.length;
    setRating(Math.round(avg * 2) / 2);
  }, [reviews, userReview]);

  //fetchingGame
  useEffect(() => {
    setLoading(true);

    async function loadGame() {
      try {
        let { data } = await axiosClient.get(`/api/games/${id}`);

        setBackgroundImage(data.background_image);
        setName(data.name);
        setPlatforms(data.platforms);
        setDescription(data.description);
      } catch (e) {
        console.error(e);
      }
    }

    async function getReviews() {
      try {
        if (user === null || user === undefined) return;

        let { data: gameReviewsExceptCurrUser } = await axiosClient.get(`/api/reviews/game/${id}/excluding/${user.username}`);
        setReviews(gameReviewsExceptCurrUser);

        let { data: currentUserReview } = await axiosClient.get(`/api/reviews/game/${id}/user/${user.username}`);
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
  }, [id, user]);

  //add game to playlist
  async function calculatePlaylists() {
    //get playlists
    setPlaylistLoading(true);
    try {
      let playlists = await getCollectionsByUserTooAdd(id || ""); //callToFunction
      console.log("Playlists gotten: ", playlists);
      setPlaylistsToAddTo(playlists);
    } catch (e: any) {
      console.log(e);
      toast.error(e.message);
    }

    setPlaylistLoading(false);
  }

  async function onSubmitAddToPlaylists() {
    setPlaylistLoading(true);
    try {
      let results = await Promise.all(
        selectedPlaylistIds.map((playlist) => {
          updateCollection(playlist.name, playlist.id, [id || ""], []);
        })
      );
      console.log(results);
      //onUpdate()
    } catch (e: any) {
      console.log(e);
      toast.error(e.message);
    }

    setPlaylistLoading(false);
    setDialogOpen(false);
  }

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

  if (user === null) {
    return <Navigate to={"/login"} />;
  }

  //add loading and if user
  if (loading) {
    return (
      <Flex
        h="100vh"
        align="center"
        justify="center"
      >
        <Spinner
          size="xl"
          color="white"
        />
      </Flex>
    );
  }
  return (
    <div>
      <Navbar />
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
                <Card.Root
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
                    <Flex
                      flexDirection={"row"}
                      justifyContent={"space-between"}
                    >
                      <Heading>{name}</Heading>
                      <Dialog.Root
                        size="cover"
                        placement="center"
                        motionPreset="slide-in-bottom"
                        open={dialogOpen}
                        onOpenChange={(details) => setDialogOpen(details.open)}
                      >
                        <Dialog.Trigger asChild>
                          <Button
                            variant="surface"
                            size="sm"
                            borderRadius={24}
                            onClick={() => {
                              calculatePlaylists();
                              setDialogOpen(true);
                            }}
                          >
                            +
                          </Button>
                        </Dialog.Trigger>
                        <Portal>
                          <Dialog.Backdrop />
                          <Dialog.Positioner>
                            <Dialog.Content>
                              <Dialog.Header>
                                <Dialog.Title>Collections</Dialog.Title>
                                <Dialog.CloseTrigger asChild>
                                  <CloseButton size="sm" />
                                </Dialog.CloseTrigger>
                              </Dialog.Header>
                              <Dialog.Body>
                                Click all the collections you want to add this game to.
                                {playlistLoading ? (
                                  <Flex
                                    justify="center"
                                    p={8}
                                  >
                                    <Spinner
                                      size="lg"
                                      color="white"
                                    />
                                  </Flex>
                                ) : (
                                  <Stack>
                                    {playlistsToAddTo.map((playlist) => (
                                      <Checkbox.Root
                                        key={playlist._id}
                                        variant={"outline"}
                                        onCheckedChange={(details) => {
                                          if (details.checked) {
                                            setSelectedPlaylistIds([...selectedPlaylistIds, { id: playlist._id, name: playlist.name }]);
                                          } else {
                                            setSelectedPlaylistIds(selectedPlaylistIds.filter((p) => p.id !== playlist._id));
                                          }
                                        }}
                                      >
                                        <Checkbox.HiddenInput />
                                        <Checkbox.Control />
                                        <Checkbox.Label>{playlist.name}</Checkbox.Label>
                                      </Checkbox.Root>
                                    ))}
                                  </Stack>
                                )}
                              </Dialog.Body>
                              {!playlistLoading && (
                                <>
                                  <Dialog.Footer>
                                    <Dialog.ActionTrigger asChild>
                                      <Button variant="outline">Cancel</Button>
                                    </Dialog.ActionTrigger>
                                    <Button onClick={() => onSubmitAddToPlaylists()}>Save</Button>
                                  </Dialog.Footer>
                                  <Dialog.CloseTrigger asChild>
                                    <CloseButton size="sm" />
                                  </Dialog.CloseTrigger>
                                </>
                              )}
                            </Dialog.Content>
                          </Dialog.Positioner>
                        </Portal>
                      </Dialog.Root>
                    </Flex>
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
                    canEdit={true}
                    setUserReview={setUserReview}
                  />
                ) : (
                  <AddReviewForm
                    gameId={id ?? ""}
                    username={user?.username ?? "Unknown User"}
                    displayName={user?.displayName ?? "Unknown User"}
                    setUserReview={setUserReview}
                  />
                )}

                {reviews.length === 0 && !userReview ? (
                  <Text>No reviews yet. Be the first to write one!</Text>
                ) : (
                  reviews.map((review) => (
                    <Review
                      key={review._id}
                      reviewId={review._id ?? ""}
                      rating={review.rating}
                      profilePage={false}
                      usersReview={false}
                      displayName={review.displayName}
                      username={review.userId}
                      comment={review.text}
                    />
                  ))
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
