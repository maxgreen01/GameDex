//NOTES//////////////////////////////////////////
//FINISH addd actual search stuff

//IMPORTS/////////////////////////////////////////
import type { FC } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

//UI IMPORTS//////////////////////////////////////
import { Input, InputGroup } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";

//-------------------------------------------------//

interface Props {
  existingInput?: string;
}

const SearchBar: FC<Props> = ({ existingInput: existingSearchInput }) => {
  const [searchInput, setSearchInput] = useState(existingSearchInput || "");
  const navigate = useNavigate();

  //function to handle the search term
  const handleSearch = (e: any) => {
    if (e.key === "Enter" && searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`); //encodeURIComponent is used to ensure that spaces and odd inputs dont break our search
      // setSearchInput("");
    }
  };

  return (
    <InputGroup
      flex="1"
      startElement={<LuSearch />}
    >
      <Input
        placeholder="Search games and users"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={handleSearch}
      />
    </InputGroup>
  );
};

export default SearchBar;
