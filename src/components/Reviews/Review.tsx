//NOTES//////////////////////////////////////////
//in game detail card, the title will be the username
//profile reviews, the title will be the game which will link to the game detail card perchance
//this will pull data from the review object

//QUESTIONS/////////////////////
// should the review title (when game) link to the game detail card? (back button will link to whatever the last page was (prop))

//IMPORTS/////////////////////////////////////////
import type { FC } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import type { ReviewType } from "@/types/types";
//UI IMPORTS//////////////////////////////////////
import {
  Card,
  Heading,
  VStack,
  Flex,
  IconButton,
  Input,
  Text,
  Avatar,
  Button,
  Spinner,
} from "@chakra-ui/react";
import Rating from "../Rating";
import { MdModeEdit, MdDelete } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import toast from "react-hot-toast";
//-------------------------------------------------//

interface Props {
  reviewId: string;
  // if this is in game details (false), the title will be the username (use user details)
  // if this is in profile (true), the title will be the game title (pass in)
  profilePage: boolean;
  // if in profile provide game title
  gameTitle?: string;
  gameId?: string;
  // if in gameDetail, send in user
  username?: string;
  displayName?: string;
  // if this is the users own review, the edit button should show up
  // if this isn't the users own review, the rating stars are read only
  usersReview: boolean;
  comment: string;
  rating: number;
  //passed down from parents for when edits and deletes happen
  setUserReview?: React.Dispatch<React.SetStateAction<ReviewType | null>>;
}

const Review: FC<Props> = ({
  reviewId,
  profilePage,
  gameTitle,
  gameId,
  username,
  displayName,
  usersReview,
  comment,
  rating,
  setUserReview,
}) => {
  let [editReview, setEditReview] = useState(false);
  // if editLoading is true, send it to parent to make page load?
  let [editLoading, setEditLoading] = useState(false);
  let [editedComment, setEditedComment] = useState(comment);
  let [loading, setLoading] = useState(false);

  //edit review button
  function clickEditButton() {
    setEditReview(true);
  }

  function onSubmitEdit() {
    setEditLoading(true);
    //validation
    //should be 500 characters or less.
    //sql injection? xxs?

    //send editedComment state to database to edit
    console.log(editedComment);
    //USEEFFECT SO EDITEDCOMMENT IS DISPLAYED wait the state does that alr but we wanna make sure we are pulling from the database.
    //give haptic to let them know it was successul
    setEditReview(false);
    setEditLoading(false);
  }

  //delete review button
  async function clickDeleteButton() {
    // to come from stack vvv
    // deleteComment(send comment id)
    setLoading(true);
    console.log("Review id: ", reviewId);
    try {
      let { data: deletedComment } = await axios.delete(
        `http://localhost:3000/api/reviews/${reviewId}`,
        { data: { userId: username } },
      );

      if (deletedComment.success) {
        toast.success(`Comment Deleted`);
      }
      if (setUserReview) {
        setUserReview(null);
      }
      setLoading(false);
    } catch (e: any) {
      console.log(e);
      toast.error(e.message);
    }
  }

  if (loading) {
    return (
      <Card.Root size="md" variant={usersReview ? "subtle" : "outline"}>
        <Card.Body color="fg.muted">
          <Spinner size="lg"></Spinner>
        </Card.Body>
      </Card.Root>
    );
  } else {
    return (
      <Card.Root size="md" variant={usersReview ? "subtle" : "outline"}>
        <Card.Header>
          <Flex w="100%" direction={"row"} justify={"space-between"}>
            {profilePage ? (
              <Link to={`/games/${gameId}`}>
                <Flex direction={"column"}>
                  <Heading size="md">
                    {gameTitle ? gameTitle : "Game Title"}
                    {""}
                  </Heading>
                  <Rating readOnly={true} value={rating} />
                </Flex>
              </Link>
            ) : (
              <Link to={`/profile/:${username}`}>
                <Flex gap={4} align="center">
                  <Flex>
                    <Avatar.Root size={"xl"} variant="outline">
                      <Avatar.Fallback name={username} />
                    </Avatar.Root>
                  </Flex>
                  <VStack gap={0} align={"flex-start"}>
                    <Text color={"white"} textStyle={"lg"}>
                      {displayName ? displayName : "display"}
                    </Text>
                    <Text textStyle={"sm"} color="gray">
                      {username ? username : "unknownUser"}
                    </Text>
                  </VStack>
                </Flex>
              </Link>
            )}

            <Flex>
              {usersReview && !editReview && (
                <>
                  <IconButton onClick={clickEditButton} variant="ghost">
                    <MdModeEdit />
                  </IconButton>
                  <IconButton onClick={clickDeleteButton} variant="ghost">
                    <MdDelete />
                  </IconButton>
                </>
              )}
              {usersReview && editReview && (
                <IconButton variant="ghost" onClick={onSubmitEdit}>
                  <FaCheck />
                </IconButton>
              )}
            </Flex>
          </Flex>
          <Flex pt={2}>
            <Rating readOnly={true} value={rating} />
          </Flex>
        </Card.Header>
        <Card.Body color="fg.muted">
          {editReview ? (
            <Input
              value={editedComment}
              onChange={(e) => setEditedComment(e.target.value)}
            ></Input>
          ) : (
            <Text>{editedComment}</Text>
          )}
        </Card.Body>
      </Card.Root>
    );
  }
};

export default Review;
