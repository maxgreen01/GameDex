//NOTES//////////////////////////////////////////
//Description: The card at the end of the carousel that says "See more" and brings you to a page of games under that category
// needs to link to somewhere
// FINISH

//IMPORTS/////////////////////////////////////////
import type { FC } from "react";
import { Link } from "react-router-dom";

//UI IMPORTS//////////////////////////////////////
import {} from "@chakra-ui/react";

//-------------------------------------------------//

interface Props {
  linkTo: String;
}

const SeeMoreCard: FC<Props> = ({linkTo}) => {
  return <div> 
    <Link to={`${linkTo}`}> </Link>
  </div>;
};

export default SeeMoreCard;
