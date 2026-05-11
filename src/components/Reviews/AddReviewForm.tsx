//NOTES//////////////////////////////////////////

//IMPORTS/////////////////////////////////////////
import type { FC } from "react";
import { useState } from "react";
import type { ReviewType } from "@/types/types";
//import * as reviewFunctions from "../../../server/data/reviews";

//UI IMPORTS//////////////////////////////////////
import { Input, Box, Field, Button, RatingGroup, Spinner } from "@chakra-ui/react";
import toast from "react-hot-toast";
import { useAxiosClient } from "@/hooks";
//-------------------------------------------------//

interface Props {
  gameId: string; //to know what game this review is for
  //put bottom 2 from currently signed in user
  username: string; // to know what user is commenting
  displayName: string;
  setUserReview: React.Dispatch<React.SetStateAction<ReviewType | null>>;
}

const AddReviewForm: FC<Props> = ({ gameId, setUserReview, username, displayName }) => {
  let [errorMessage, setErrorMessage] = useState<string | null>(null);
  let [rating, setRating] = useState<number>(0);
  let [comment, setComment] = useState("");
  let [showForm, setShowForm] = useState(false);
  let [loading, setLoading] = useState(false);

  const axiosClient = useAxiosClient();

  function commentOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setComment(value);

    if (value.length > 500) {
      setErrorMessage("Comment cannot exceed 500 characters.");
    } else {
      setErrorMessage(null);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (comment.length === 0) {
      setErrorMessage("You haven't typed anything yet!");
      return;
    }

    if (comment.length > 500) {
      setErrorMessage("Comment cannot exceed 500 characters!");
      return;
    }

    if (rating === 0) {
      setErrorMessage("Please provide a rating!");
      return;
    }
    setLoading(true);
    //setUserReview(newReview);

    try {
      await axiosClient.post(`/api/reviews`, {
        gameId,
        userId: username,
        rating,
        text: comment,
        displayName,
      });

      let { data: userReview } = await axiosClient.get(`/api/reviews/game/${gameId}/user/${username}`);

      if (!userReview) {
        console.log("Error: Review could not be added");
        toast.error("Error: Review could not be added");
      } else {
        setUserReview(userReview);
      }
    } catch (e) {
      console.log("Error: Review could not be added");
      toast.error("Error: Review could not be added");
    }
    setShowForm(false); //idt this is needed by once reivew is given it shud swtich to show the review and not form in game details

    setLoading(false);
  }

  if (loading) {
    return (
      <>
        <Box>
          <Spinner
            size="lg"
            color={"white"}
          ></Spinner>
        </Box>
      </>
    );
  } else if (!showForm) {
    return (
      <>
        <Box>
          <Button
            w={"100%"}
            onClick={() => setShowForm(true)}
          >
            Add A Review
          </Button>
        </Box>
      </>
    );
  } else {
    return (
      <>
        <Box
          p="4"
          borderWidth="1px"
          borderColor="border.disabled"
        >
          <form onSubmit={onSubmit}>
            {/* rating */}
            <Field.Root invalid={rating === 0 && !!errorMessage}>
              <Field.Label p={2}>Rating:</Field.Label>
              <RatingGroup.Root
                pl={2}
                count={5}
                value={rating}
                onValueChange={({ value }) => {
                  console.log(value, typeof value);
                  setRating(value);
                }}
                allowHalf
              >
                <RatingGroup.HiddenInput />
                <RatingGroup.Control />
              </RatingGroup.Root>
              <Field.ErrorText>Please provide a rating!</Field.ErrorText>
            </Field.Root>
            {/* comment */}
            <Field.Root invalid={!!errorMessage}>
              <Field.Label p={2}>Your Review:</Field.Label>
              <Input
                value={comment}
                onChange={(e) => commentOnChange(e)}
              />
              <Field.ErrorText>{"Must be 500 characters or less!"}</Field.ErrorText>
            </Field.Root>
            <Button type="submit">Submit</Button>
          </form>
        </Box>
      </>
    );
  }
};

export default AddReviewForm;
