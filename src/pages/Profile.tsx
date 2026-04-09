//NOTES//////////////////////////////////////////
//FINISH EDIT BUTTON FEATURE
// CACHE REVIEWS AND COLLECTIONS in case they click back and forth 

//IMPORTS////////////////////////////////////////
import type { FC } from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import type { User } from "firebase/auth";

//UI IMPORTS//////////////////////////////////////
import Navbar from "@/components/Navbar";
import Review from "@/components/Reviews/Review";
import {
  Flex,
  Box,
  Avatar,
  VStack,
  HStack,
  Text,
  IconButton,
  Button,
  Separator,
} from "@chakra-ui/react";
import { MdModeEdit } from "react-icons/md";

interface Props {}

const Profile: FC<Props> = ({}) => {
  // Logout functionality
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [numFriends, setNumFriends] = useState<number>(0);
  // true means Collections is active/black/clickedOn, false means Collections is active/black
  const [activeButton, setActiveButton] = useState<boolean>(false);
  // true means reviews are being shown, false means collections are being shown

  const [showReviewsNotCollections, setShowReviewsNotCollections] = useState<boolean>(true);

  // IS THIS RIGHT
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/login");
        return;
      }

      setUser(firebaseUser);

      const snap = await getDoc(doc(db, "users", firebaseUser.uid));

      if (snap.exists()) {
        const data = snap.data();
        console.log("Data: ", data);
        setUsername(data.username);
        setDisplayName(data.displayName);
        //calcuating # friends
        setNumFriends(data.friends.length);
      } else {
        setUsername("User");
        //ADD? what is this for ^
        setDisplayName("N/A");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Reviews and Collections Section
  function clickReviews() {
    setActiveButton(false);
    setShowReviewsNotCollections(true); 
  }

  function clickCollections() {
    setActiveButton(true);
    setShowReviewsNotCollections(false); 
  }

  return (
    <div>
      <Navbar username={username} profilePage={true}></Navbar>
      <Flex direction="column">
        {/* Profile Header */}
        <Box w="100%">
          <Flex
            m="8"
            mx="12"
            gap={4}
            direction={"row"}
            align="center"
            justify="space-between"
          >
            {/* Left hand side */}
            <Flex gap={4} align="center">
              {/* icon */}
              <Flex>
                <Avatar.Root size={"xl"} variant="outline">
                  <Avatar.Fallback name={username} />
                </Avatar.Root>
              </Flex>
              <VStack gap={0} align={"flex-start"}>
                <Text color={"white"} textStyle={"lg"}>
                  {displayName}
                </Text>
                <Text textStyle={"sm"}>{username}</Text>
              </VStack>

              <Flex>
                <IconButton variant={"ghost"}>
                  <MdModeEdit />
                </IconButton>
              </Flex>
            </Flex>

            <Flex>
              <VStack gap={0}>
                <Text>Friends</Text>
                <Text>{numFriends}</Text>
              </VStack>
            </Flex>
          </Flex>
        </Box>

        <Separator variant="solid" />

        {/* Reviews and Collections */}
        <Box w="100%">
          <HStack m={4}>
            <Button
              variant={!activeButton ? "plain" : "solid"}
              w="50%"
              onClick={clickReviews}
            >
              Reviews
            </Button>
            <Button
              variant={activeButton ? "plain" : "solid"}
              w="50%"
              onClick={clickCollections}
            >
              Collections
            </Button>
          </HStack>
        </Box>

        <Box>
          {showReviewsNotCollections ? 
          (<Text>
            {/* WHERE REVIEW STACK WILL GO */}
            {/* <Review></Review> */}
          </Text>) : (<Text>
            collections
          </Text>)
        }
        </Box>
      </Flex>
    </div>
  );
};

export default Profile;
