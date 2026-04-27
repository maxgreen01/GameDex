//NOTES//////////////////////////////////////////
// this is static right now
//IMPORTS/////////////////////////////////////////
import type { FC } from "react";

//UI IMPORTS//////////////////////////////////////
import { RatingGroup } from "@chakra-ui/react";

//-------------------------------------------------//

interface Props {
  readOnly: boolean; //not editable rating
  value: Number; //# stars colored in
  starSize?: "sm" | "lg"; //sm default, larger for gameDetails
}

const Rating: FC<Props> = ({ readOnly, value, starSize }) => {
  return (
    <div>
      <RatingGroup.Root
        {...(readOnly && { readOnly: true })}
        allowHalf
        count={5}
        defaultValue={Number(value)}
        size={starSize ? starSize : "sm"}
      >
        <RatingGroup.HiddenInput />
        <RatingGroup.Control />
      </RatingGroup.Root>
    </div>
  );
};

export default Rating;
