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
}

const Rating: FC<Props> = ({ readOnly, value }) => {
  return (
    <div>
      <RatingGroup.Root
        {...(readOnly && { readOnly: true })}
        allowHalf
        count={5}
        defaultValue={Number(value)}
        size="sm"
      >
        <RatingGroup.HiddenInput />
        <RatingGroup.Control />
      </RatingGroup.Root>
    </div>
  );
};

export default Rating;
