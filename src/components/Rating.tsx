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
  onValueChange?: (value: number) => void; // optional so readOnly usage doesn't need it
}

const Rating: FC<Props> = ({ readOnly, value, starSize, onValueChange }) => {
  return (
    <div>
      <RatingGroup.Root
        {...(readOnly && { readOnly: true })}
        allowHalf
        count={5}
        value={Number(value)}
        onValueChange={({ value }) => onValueChange?.(value)}
        size={starSize ? starSize : "sm"}
      >
        <RatingGroup.HiddenInput />
        <RatingGroup.Control />
      </RatingGroup.Root>
    </div>
  );
};

export default Rating;
