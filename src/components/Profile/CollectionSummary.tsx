//IMPORTS////////////////////////////////////////
import { Link } from "react-router-dom";
import type { CollectionSummary as TCollectionSummary } from "@/types/types.ts";
import { useRef, useState, useEffect, useContext } from "react";
import { updateCollection, deleteCollection as delCol } from "@/data/collections";
//UI IMPORTS//////////////////////////////////////
import { Card, HStack, Flex, Box, Input, Field, VStack, Image, Spinner, Carousel, IconButton, Link as ChakraLink, Text } from "@chakra-ui/react";
import { MdModeEdit, MdDelete } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import toast from "react-hot-toast";
import { sum } from "firebase/firestore";
import AuthContext from "@/components/Auth/AuthContext.tsx";

interface Props {
  summary: TCollectionSummary;
  onUpdate: () => void;
  onDelete: () => void;
}

function CollectionSummary({ summary, onUpdate, onDelete }: Props) {
  //edits and deletes
  let [editCollection, setEditCollection] = useState(false);
  let [deleteCollection, setDeleteCollection] = useState(false);
  let [collectionTitle, setCollectionTitle] = useState(summary.name);
  let [loading, setLoading] = useState(false);
  let [errorMessage, setErrorMessage] = useState<string | null>(null);
  let [gameIdsToRemove, setGameIdsToRemove] = useState<string[]>([]);

  const [user] = useContext(AuthContext);

  function clickEditButton() {
    setEditCollection(true);
  }

  //for title
  function commentOnChange(e: string) {
    const value = e;
    setCollectionTitle(value);

    if (value.length > 70) {
      setErrorMessage("Comment cannot exceed 70 characters.");
    } else {
      setErrorMessage(null);
    }
  }

  async function onSubmitEdit() {
    //validation
    if (collectionTitle.length === 0) {
      setErrorMessage("You haven't typed anything yet!");
      return;
    }

    if (collectionTitle.length > 70) {
      setErrorMessage("Comment cannot exceed 70 characters!");
      return;
    }

    setLoading(true);

    //Update title and games
    try {
      let result = await updateCollection(collectionTitle, summary._id, [], gameIdsToRemove);
      //idk do smtg w result? cud be an error

      onUpdate(); //triggers refetch in parent
      setEditCollection(false);
      setGameIdsToRemove([]);
      console.log(result);
    } catch (e: any) {
      console.log(e);
      toast.error(e.message);
    }

    setLoading(false);
  }

  async function onClickGame(gameId: string) {
    console.log("clicking game:", gameId, typeof gameId);
    if (gameIdsToRemove.includes(gameId)) {
      setGameIdsToRemove(gameIdsToRemove.filter((game) => game !== gameId));
    } else {
      setGameIdsToRemove([...gameIdsToRemove, gameId]);
    }

    console.log(gameId);
  }

  //delete collection button
  async function clickDeleteButton(collectionId: string) {
    setLoading(true);
    try {
      let result = await delCol(collectionId);
      onDelete();
      console.log(result);
      toast.success("Collection deleted!");
    } catch (e: any) {
      console.log(e);
      toast.error(e.message);
    }

    setLoading(false);
  }

  //make # of cards in summary dynamic
  const carouselRef = useRef(null);
  let [slidesPerPageDependingOnViewport, setSlidesPerPageDependingOnViewport] = useState(4);

  //using ResizeObserver to do this
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      if (width > 50) {
        // ignore tiny widths during re-render
        setSlidesPerPageDependingOnViewport(Math.max(1, Math.floor(width / 85)));
      }
    });
    if (carouselRef.current) observer.observe(carouselRef.current);
    return () => observer.disconnect();
  }, []);
  console.log("slideCount:", summary.games.length, "slidesPerPage:", slidesPerPageDependingOnViewport);

  if (loading) {
    return (
      <Card.Root
        size="md"
        variant="subtle"
      >
        <Card.Body color="fg.muted">
          <Spinner size="lg"></Spinner>
        </Card.Body>
      </Card.Root>
    );
  } else {
    return (
      <Card.Root
        size="md"
        variant="subtle"
      >
        <Card.Header>
          <Flex
            w="100%"
            direction={"row"}
            justify={"space-between"}
          >
            <Flex>
              {editCollection ? (
                <Field.Root invalid={!!errorMessage}>
                  {/* <Field.Label p={2}>Title:</Field.Label> */}
                  <Input
                    value={collectionTitle}
                    onChange={(e) => commentOnChange(e.target.value)}
                  ></Input>
                  <Field.ErrorText>{errorMessage}</Field.ErrorText>
                </Field.Root>
              ) : (
                <div>
                  <Card.Title>{summary.name}</Card.Title>
                  <Text textStyle="sm">
                    Includes {summary.games.length} game{summary.games.length === 1 ? "" : "s"}.
                  </Text>
                </div>
              )}
            </Flex>

            <Flex>
              {!editCollection && user?.username === summary.userId && (
                <>
                  <IconButton
                    onClick={clickEditButton}
                    variant="ghost"
                  >
                    <MdModeEdit />
                  </IconButton>
                  <IconButton
                    onClick={() => clickDeleteButton(summary._id)}
                    variant="ghost"
                  >
                    <MdDelete />
                  </IconButton>
                </>
              )}
              {editCollection && (
                <IconButton
                  variant="ghost"
                  onClick={onSubmitEdit}
                >
                  <FaCheck />
                </IconButton>
              )}
            </Flex>
          </Flex>
        </Card.Header>
        <Card.Body>
          <Carousel.Root
            ref={carouselRef}
            slideCount={summary.games.length}
            slidesPerPage={slidesPerPageDependingOnViewport}
          >
            <Carousel.ItemGroup>
              {editCollection
                ? summary.games.map((game, index) => (
                    <Carousel.Item
                      index={index}
                      key={game.gameId}
                    >
                      <Box
                        position="relative"
                        display="inline-block"
                        onClick={() => onClickGame(game.gameId)}
                        cursor="pointer"
                        css={{
                          "&:hover .overlay": { opacity: 1 },
                        }}
                      >
                        <Image
                          key={game.gameImage}
                          src={game.gameImage}
                          height="100px"
                          aspectRatio={3 / 4}
                          rounded="md"
                        />

                        <Box
                          className="overlay"
                          position="absolute"
                          top={0}
                          left={0}
                          right={0}
                          bottom={0}
                          bg="blackAlpha.700"
                          rounded="md"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          opacity={gameIdsToRemove.includes(game.gameId) ? 1 : 0}
                          transition="opacity 0.2s"
                        >
                          <IconButton variant="plain">
                            <MdDelete />
                          </IconButton>
                        </Box>
                      </Box>
                    </Carousel.Item>
                  ))
                : summary.games.map((game, index) => (
                    <Link
                      to={`/games/${game.gameId}`}
                      key={game.gameId}
                    >
                      <Carousel.Item
                        index={index}
                        key={game.gameId}
                      >
                        <Image
                          key={game.gameImage}
                          src={game.gameImage}
                          height="100px"
                          aspectRatio={3 / 4}
                          rounded="md"
                        />
                      </Carousel.Item>
                    </Link>
                  ))}
            </Carousel.ItemGroup>
          </Carousel.Root>
        </Card.Body>
      </Card.Root>
    );
  }
}

export default CollectionSummary;
