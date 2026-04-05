//NOTES//////////////////////////////////////////
//always same bc they must login
//logo and profile icon
//take out border if u want or j make bottom border
//is user ID in home page yes bc custom alg
//if user has pending friend requests we could put a border around the icon in a color>

//IMPORTS/////////////////////////////////////////
import type { FC } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";

//UI IMPORTS//////////////////////////////////////
import { Box, Flex, Avatar, Image, Text } from "@chakra-ui/react";

//-------------------------------------------------//

interface Props {
  username: string;
}

const Navbar: FC<Props> = ({ username }) => {
  return (
    <div>
      <Box
        w="100%"
        p="4"
        color="white"
        borderBottomWidth="1px"
        borderBottomColor="#27272a"
      >
        <Flex direction={"row"} justify="space-between" align="center">
          {/* logo */}
          <Flex align="center" gap={2}>
            <Image src={logo} alt="logo" boxSize="32px" />
            <Text as="h2" m={0} lineHeight="1">GameDex</Text>
          </Flex>
          {/* user icon */}
          <Flex>
            <Link to={`/profile/${username}`}>
              <Avatar.Root variant="outline">
                <Avatar.Fallback name={username} />
              </Avatar.Root>
            </Link>
          </Flex>
        </Flex>
      </Box>
    </div>
  );
};

export default Navbar;
