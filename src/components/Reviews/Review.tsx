//NOTES//////////////////////////////////////////
//in game detail card, the title will be the username
//profile reviews, the title will be the game which will link to the game detail card perchance
//this will pull data from the review object

//QUESTIONS/////////////////////
// should the review title (when game) link to the game detail card? (back button will link to whatever the last page was (prop))

//IMPORTS/////////////////////////////////////////
import type { FC } from "react";
import { useState } from "react";

//UI IMPORTS//////////////////////////////////////
import { Card, Heading, Stack, Flex, IconButton, Input, Text } from "@chakra-ui/react";
import Rating from "../Rating";
import { MdModeEdit } from "react-icons/md";

//-------------------------------------------------//

interface Props {
  title: string;
  comment: string;
  rating: number;
}

const Review: FC<Props> = ({ title, comment, rating }) => {
  const [readOnly, setReadonly] = useState<boolean>(true);

  //edit button

  function clickEditButton() {}

  return (
    <Card.Root size="md">
      <Card.Header>
        <Flex
          w="100%"
          direction={"row"}
          justify={"space-between"}
        >
          <Flex direction={"column"}>
            <Heading size="md">{title ? title : "Game Title"} </Heading>
            <Rating
              readOnly={readOnly}
              value={rating}
            />
          </Flex>

          <Flex>
            <IconButton
              onClick={clickEditButton}
              variant="ghost"
            >
              <MdModeEdit />
            </IconButton>
          </Flex>
        </Flex>
      </Card.Header>
      <Card.Body color="fg.muted">{readOnly ? <Text>{comment}</Text> : <Input placeholder={comment}></Input>}</Card.Body>
    </Card.Root>
  );
};

export default Review;
