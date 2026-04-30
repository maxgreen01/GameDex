//NOTES//////////////////////////////////////////
//FINISH EDIT BUTTON FEATURE

//IMPORTS////////////////////////////////////////
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FC, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import type { ProfileData, User } from "../../shared/types";
import { getUserByUsername, updateUserProfile } from "../data/users.ts";

//UI IMPORTS//////////////////////////////////////
import Navbar from "@/components/Navbar";
import ProfileEditButton from "@/components/Profile/ProfileEditButton.tsx";
import Review from "@/components/Reviews/Review";
import { Flex, Box, Avatar, VStack, Text, Separator, Tabs } from "@chakra-ui/react";
import NotFoundPage from "@/pages/NotFoundPage.tsx";

const EMPTY_USER: User = {
  username: "N/A",
  email: "N/A",
  displayName: "N/A",
  description: "N/A",
  friends: [],
  pendingInvites: [],
  reviews: [],
  createdAt: -1,
};

const Profile: FC<object> = () => {
  const { username } = useParams();
  if (username === undefined) return <NotFoundPage />;

  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User>(EMPTY_USER);

  // IS THIS RIGHT
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/login");
        return;
      }

      const snap = await getDoc(doc(db, "users", firebaseUser.uid));

      if (snap.exists()) {
        const data = snap.data() as User;
        console.log("Data: ", data);
        setCurrentUser(data);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const queryClient = useQueryClient();
  const userQuery = useQuery({
    queryKey: ["getUser", username],
    queryFn: () => getUserByUsername(username),
    placeholderData: EMPTY_USER,
    retry: false,
  });
  const userMutation = useMutation<void, void, ProfileData>({
    mutationFn: (profileData) => updateUserProfile(username, profileData),
    onSuccess: () => queryClient.invalidateQueries(), // TODO: More precise invalidation?
  });

  if (userQuery.isError) {
    return <NotFoundPage />;
  } else {
    const user = userQuery.data as User;
    return (
      <div>
        <Navbar
          username={currentUser.username}
          profilePage={true}
        ></Navbar>
        <Flex direction="column">
          {/* Profile Header */}
          <Box w="100%">
            <Flex
              m={8}
              mx={12}
              gap={4}
              direction="row"
              align="center"
              justify="space-between"
            >
              {/* Left hand side */}
              <Flex
                gap={4}
                align="center"
              >
                {/* icon */}
                <Flex>
                  <Avatar.Root
                    size="xl"
                    variant="outline"
                  >
                    <Avatar.Fallback name={user.username} />
                  </Avatar.Root>
                </Flex>
                <VStack
                  gap={0}
                  align="flex-start"
                >
                  <Text
                    color="white"
                    textStyle="lg"
                  >
                    {user.displayName}
                  </Text>
                  <Text textStyle="sm">{user.username}</Text>
                </VStack>

                <Flex>
                  <ProfileEditButton
                    initialData={user}
                    onAction={userMutation.mutate}
                  />
                </Flex>
              </Flex>

              <Flex>
                <VStack gap={0}>
                  <Text>Friends</Text>
                  <Text>{user.friends.length}</Text>
                </VStack>
              </Flex>
            </Flex>
            <Flex m={8}>
              <Text>{user.description.length ? user.description : "(No description set.)"}</Text>
            </Flex>
          </Box>

          <Separator variant="solid" />

          <Tabs.Root
            defaultValue="reviews"
            fitted
            variant="subtle"
          >
            <Tabs.List m={4}>
              <Tabs.Trigger value="reviews">Reviews</Tabs.Trigger>
              <Tabs.Trigger value="collections">Collections</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="reviews">
              <Text>
                {/* WHERE REVIEW STACK WILL GO */}
                {/* <Review></Review> */}
              </Text>
            </Tabs.Content>
            <Tabs.Content value="collections">collections</Tabs.Content>
          </Tabs.Root>
        </Flex>
      </div>
    );
  }
};

export default Profile;
