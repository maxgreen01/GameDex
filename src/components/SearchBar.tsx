//NOTES//////////////////////////////////////////
//FINISH addd actual search stuff


//IMPORTS/////////////////////////////////////////
import type { FC } from "react";

//UI IMPORTS//////////////////////////////////////
import { Input, InputGroup } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";

//-------------------------------------------------//

interface Props {}

const SearchBar: FC<Props> = ({}) => {
  return (
    <InputGroup flex="1" startElement={<LuSearch />}>
      <Input placeholder="Search games" />
    </InputGroup>
  );
};

export default SearchBar;
