//NOTES//////////////////////////////////////////
//always same bc they must login
//logo and profile icon
//take out border if u want or j make bottom border
//is user ID in home page yes bc custom alg
//if user has pending friend requests we could put a border around the icon in a color>

//IMPORTS/////////////////////////////////////////
import type { FC } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.svg";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseClient";

//UI IMPORTS//////////////////////////////////////
import { Box, Button, Flex, Avatar, Image, Text, Menu, Portal } from "@chakra-ui/react";
import toast from "react-hot-toast";
//-------------------------------------------------//

interface Props {
  username: string;
  profilePage: boolean;
}

const Navbar: FC<Props> = ({ username, profilePage }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logout successful!");
      navigate("/login");
    } catch (e: any) {
      toast.error(e.message || "Logout failed.");
    }
  };

  return (
    <Box
      w="100%"
      p="4"
      color="white"
      borderBottomWidth="1px"
      borderBottomColor="#27272a"
      position="sticky"
      top="0"
      h="fit-content"
      backgroundColor={"#16171d"}
      zIndex="sticky"
    >
      <Flex
        direction={"row"}
        justify="space-between"
        align="center"
      >
        {/* logo */}
        <Link to={`/mainfeed`}>
          <Flex
            align="center"
            gap={2}
          >
            <Image
              src={logo}
              alt="logo"
              boxSize="32px"
            />
            <Text
              as="h2"
              m={0}
              lineHeight="1"
            >
              GameDex
            </Text>
          </Flex>
        </Link>
        {/* user icon */}
        <Flex>
          {profilePage ? (
            <Button
              variant="ghost"
              onClick={handleLogout}
            >
              Logout
            </Button>
          ) : (
            <Menu.Root positioning={{ placement: "bottom" }}>
              <Menu.Trigger
                rounded="full"
                focusRing="outside"
              >
                <Avatar.Root variant="outline">
                  <Avatar.Fallback name={username} />
                </Avatar.Root>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    <Menu.Item
                      value={`/profile/${username}`}
                      onClick={() => navigate(`/profile/${username}`)}
                    >
                      Profile
                    </Menu.Item>
                    <Menu.Item
                      color="fg.error"
                      value={`logout`}
                      onClick={handleLogout}
                    >
                      Logout
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;
