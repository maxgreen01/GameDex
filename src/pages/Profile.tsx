//NOTES//////////////////////////////////////////
//FINISH EDIT BUTTON FEATURE

//IMPORTS////////////////////////////////////////
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FC, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { ProfileData, User } from "../../shared/types";
import type { CollectionSummary as TCollectionSummary, ReviewType } from "@/types/types";
import { addCollection, getCollectionSummariesByUserId } from "../data/collections.ts";
import { getUserByUsername, updateUserProfile } from "../data/users.ts";

//UI IMPORTS//////////////////////////////////////
import Navbar from "@/components/Navbar";
import CollectionSummary from "@/components/Profile/CollectionSummary.tsx";
import ProfileEditButton from "@/components/Profile/ProfileEditButton.tsx";
import ProfileFriendPopup from "@/components/Profile/ProfileFriendPopup.tsx";
import Review from "@/components/Reviews/Review";
import { Flex, Box, Avatar, VStack, Text, Field, Input, Separator, Button, Tabs, Spinner, HStack, Icon } from "@chakra-ui/react";
import NotFoundPage from "@/pages/NotFoundPage.tsx";
import AuthContext from "../components/Auth/AuthContext.tsx";
import toast from "react-hot-toast";
import { useAxiosClient } from "@/hooks.ts";
import { MdGroupAdd, MdNotInterested, MdPersonAdd } from "react-icons/md";

const EMPTY_USER: User = {
  username: "N/A",
  email: "N/A",
  displayName: "N/A",
  description: "N/A",
  friends: [],
  incomingRequests: [],
  outgoingRequests: [],
  reviews: [],
  createdAt: -1,
};

const Profile: FC<object> = () => {
  const { username } = useParams();

  const [currentUser] = useContext(AuthContext);
  const [userReviews, setUserReviews] = useState<ReviewType[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showAddCollectionForm, setShowAddCollectionForm] = useState(false);
  const [newCollectionTitle, setNewCollectionTitle] = useState("");
  const [collectionLoading, setCollectionLoading] = useState(false);

  // no need to store friend info in state because it comes directly from the user query
  const [showFriendsList, setShowFriendsList] = useState(false);
  const [showFriendRequests, setShowFriendRequests] = useState(false);

  let [errorMessage, setErrorMessage] = useState<string | null>(null);

  const axiosClient = useAxiosClient();

  const queryClient = useQueryClient();
  const userQuery = useQuery({
    queryKey: ["getUser", username],
    queryFn: () => getUserByUsername(username),
    placeholderData: EMPTY_USER,
    retry: false,
  });

  const collectionsQuery = useQuery({
    queryKey: ["getCollectionsByUserId", username],
    queryFn: () => getCollectionSummariesByUserId(username),
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const userMutation = useMutation<void, void, ProfileData>({
    mutationFn: (profileData) => updateUserProfile(username, profileData),
    onSuccess: () => queryClient.invalidateQueries(), // TODO: More precise invalidation?
  });

  useEffect(() => {
    if (!userQuery.data || userQuery.data.username === "N/A") return;

    async function getUserReviews() {
      try {
        setReviewsLoading(true);

        let { data: reviews } = await axiosClient.get(`http://localhost:3000/api/reviews/user/${userQuery.data.username}`);

        let reviewsWithTitles = await Promise.all(
          reviews.map(async (review: ReviewType) => {
            let { data: game } = await axiosClient.get(`http://localhost:3000/api/games/${review.gameId}`);

            return {
              ...review,
              gameTitle: game?.name ?? review.gameId,
            };
          })
        );

        setUserReviews(reviewsWithTitles);
      } catch {
        setUserReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    }

    getUserReviews();
  }, [userQuery.data]);

  if (username === undefined || userQuery.isError) {
    return <NotFoundPage />;
  }

  const user = userQuery.data as User;
  const isSelf = user?.username === currentUser?.username;
  const collections = collectionsQuery.data as TCollectionSummary[] | undefined;
  const friends = user.friends ?? [];
  const friendRequests = user.incomingRequests ?? [];

  // adding collection forms
  function onUpdate() {
    queryClient.invalidateQueries({ queryKey: ["getCollectionsByUserId", username] });
  }
  function onChangeAddCollection(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setNewCollectionTitle(value);

    if (value.length > 50) {
      setErrorMessage("Collection title cannot exceed 50 characters.");
    } else {
      setErrorMessage(null);
    }
  }
  async function onSubmitAddCollection(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (newCollectionTitle.length === 0) {
      setErrorMessage("You haven't typed anything yet!");
      return;
    }

    if (newCollectionTitle.length > 500) {
      setErrorMessage("Comment cannot exceed 500 characters!");
      return;
    }

    setCollectionLoading(true);

    try {
      let result = await addCollection(newCollectionTitle);
      console.log(result);
      toast.success("Collection added!");
      onUpdate();
    } catch (e) {
      toast.error("Error: Collection could not be added");
    }

    setNewCollectionTitle("");
    setCollectionLoading(false);
    setShowAddCollectionForm(false);
  }

  // Update a user's friend data in the cache instead of refetching the entire user.
  // Use `options` to specify whether to add to or remove from `friends`, `incomingRequests`, or `outgoingRequests`.
  function updateUserFriendsCache(user: string, otherUser: string, options: { [key in "friends" | "incomingRequests" | "outgoingRequests"]?: "add" | "remove" | undefined }) {
    queryClient.setQueryData<User>(["getUser", user], (old) => {
      if (!old) return old;

      // Helper function to process the add/remove logic for a specific array
      const processList = (list: string[], action?: "add" | "remove") => {
        if (action === "add") {
          return [...list, otherUser];
        } else if (action === "remove") {
          return list.filter((id) => id !== otherUser);
        } else {
          return list; // Return original array if no action is specified
        }
      };

      return {
        ...old,
        friends: processList(old.friends, options.friends),
        incomingRequests: processList(old.incomingRequests, options.incomingRequests),
        outgoingRequests: processList(old.outgoingRequests, options.outgoingRequests),
      };
    });
  }

  // Either accept or decline an incoming friend request
  async function updateIncomingFriendRequest(friend: string, action: "accept" | "decline") {
    try {
      let successVerb: string;

      switch (action) {
        case "accept":
          await axiosClient.post(`http://localhost:3000/api/users/${currentUser?.username}/friends/${friend}`);
          successVerb = "accepted";
          break;
        case "decline":
          await axiosClient.put(`http://localhost:3000/api/users/${currentUser?.username}/friends/${friend}`);
          successVerb = "declined";
          break;
        default:
          throw new Error(`Invalid action "${action}" for updateIncomingFriendRequest function!`);
      }

      // update the query data for both users to avoid refetching their entire objects

      // even if the action is taken from another user's page, the current user is actually the recipient
      const recipient = (isSelf ? username : currentUser?.username) ?? "";
      // always remove the invite, and only add to the friends list if the request was accepted
      updateUserFriendsCache(recipient, friend, { incomingRequests: "remove", friends: action === "accept" ? "add" : undefined });
      updateUserFriendsCache(friend, recipient, { outgoingRequests: "remove", friends: action === "accept" ? "add" : undefined });

      toast.success(`Successfully ${successVerb} friend request!`);
    } catch (e) {
      console.error(`Failed to ${action} friend request:`, e);
      toast.error(`Failed to ${action} friend request.`);
    }
  }

  // Either send or cancel an outgoing friend request
  async function updateOutgoingFriendRequest(friend: string, action: "send" | "cancel") {
    try {
      let successVerb: string;

      // the current user is always the sender
      switch (action) {
        case "send":
          await axiosClient.post(`http://localhost:3000/api/users/${currentUser?.username}/friends/${friend}`);
          updateUserFriendsCache(currentUser?.username ?? "", friend, { outgoingRequests: "add" });
          updateUserFriendsCache(friend, currentUser?.username ?? "", { incomingRequests: "add" });
          successVerb = "sent";
          break;
        case "cancel":
          await axiosClient.put(`http://localhost:3000/api/users/${currentUser?.username}/friends/${friend}`);
          updateUserFriendsCache(currentUser?.username ?? "", friend, { outgoingRequests: "remove" });
          updateUserFriendsCache(friend, currentUser?.username ?? "", { incomingRequests: "remove" });
          successVerb = "cancelled";
          break;
        default:
          throw new Error(`Invalid action "${action}" for updateOutgoingFriendRequest function!`);
      }

      toast.success(`Friend request ${successVerb}!`);
    } catch (e) {
      console.error(`Failed to ${action} friend request:`, e);
      toast.error(`Failed to ${action} friend request.`);
    }
  }

  // Remove an existing friend
  async function removeFriend(friend: string) {
    try {
      await axiosClient.delete(`http://localhost:3000/api/users/${currentUser?.username}/friends/${friend}`);

      updateUserFriendsCache(currentUser?.username ?? "", friend, { friends: "remove" });
      updateUserFriendsCache(friend, currentUser?.username ?? "", { friends: "remove" });

      toast.success(`Friend "${friend}" removed!`);
    } catch (e) {
      console.error(`Failed to remove friend:`, e);
      toast.error(`Failed to remove friend.`);
    }
  }

  return (
    <div>
      <Navbar profilePage />

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

              {isSelf && (
                <Flex>
                  <ProfileEditButton
                    initialData={user}
                    onAction={userMutation.mutate}
                  />
                </Flex>
              )}

              {/* friend request button - never show for your own profile or if you're already friends */}
              {/* // todo this and the friend popups go off screen with thin windows */}
              {!isSelf &&
                currentUser?.username &&
                !friends.includes(currentUser?.username) &&
                (currentUser?.incomingRequests?.includes(user.username) ? (
                  // current user has an incoming request from this profile user, so show accept button
                  <Flex>
                    <Button
                      onClick={() => updateIncomingFriendRequest(user.username, "accept")}
                      variant="outline"
                    >
                      <MdPersonAdd /> <Text>Accept Friend Request</Text>
                    </Button>
                  </Flex>
                ) : currentUser?.outgoingRequests?.includes(user.username) ? (
                  // outgoing request exists, so show cancel button
                  <Flex>
                    <Button
                      onClick={() => updateOutgoingFriendRequest(user.username, "cancel")}
                      variant="outline"
                    >
                      <MdNotInterested /> <Text>Cancel Friend Request</Text>
                    </Button>
                  </Flex>
                ) : (
                  // send a new request
                  <Flex>
                    <Button
                      onClick={() => updateOutgoingFriendRequest(user.username, "send")}
                      variant="outline"
                    >
                      <MdGroupAdd /> <Text>Send Friend Request</Text>
                    </Button>
                  </Flex>
                ))}
            </Flex>

            {/* friend info stack */}
            <Flex>
              <HStack gap={10}>
                {/* friends popup */}
                <ProfileFriendPopup
                  data={friends}
                  username={user.username}
                  isOpen={showFriendsList}
                  isSelf={isSelf}
                  onOpenChange={(e) => {
                    setShowFriendsList(e.open);
                    setShowFriendRequests(false);
                  }}
                  updateData={(friend, _action) => removeFriend(friend)}
                />

                {/* incoming friend requests popup */}
                {isSelf && (
                  <ProfileFriendPopup
                    data={friendRequests}
                    isRequests
                    username={user.username}
                    isSelf={isSelf}
                    isOpen={showFriendRequests}
                    onOpenChange={(e) => {
                      setShowFriendRequests(e.open);
                      setShowFriendsList(false);
                    }}
                    updateData={updateIncomingFriendRequest}
                  />
                )}
              </HStack>
            </Flex>
          </Flex>

          <Flex m={8}>
            <Text>{user.description || "(No description set.)"}</Text>
          </Flex>
        </Box>

        {/* Bottom part of page */}
        <Separator variant="solid" />

        {showAddCollectionForm ? (
          <>
            <Flex
              justifyContent={"center"}
              alignItems={"center"}
              // minH={"50vh"}
              h={"calc(100vh - 400px)"}
            >
              <Box w={"400px"}>
                <form onSubmit={onSubmitAddCollection}>
                  <Field.Root invalid={!!errorMessage}>
                    <Field.Label p={2}>New Collection Title</Field.Label>
                    <Input
                      value={newCollectionTitle}
                      onChange={(e) => onChangeAddCollection(e)}
                    />
                    <Field.ErrorText>{errorMessage}</Field.ErrorText>
                  </Field.Root>
                  <Flex
                    boxSizing={"border-box"}
                    gap={4}
                    w={"100%"}
                    pt={4}
                  >
                    <Button
                      w="50%"
                      flex={1}
                      variant="outline"
                      onClick={() => {
                        setShowAddCollectionForm(false);
                        setNewCollectionTitle("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      w="50%"
                      flex={1}
                      type="submit"
                    >
                      Submit
                    </Button>
                  </Flex>
                </form>
              </Box>
            </Flex>
          </>
        ) : (
          //  tabs
          <Tabs.Root
            defaultValue="reviews"
            fitted
            variant="subtle"
          >
            <Tabs.List m={4}>
              <Tabs.Trigger value="reviews">Reviews</Tabs.Trigger>
              <Tabs.Trigger value="collections">Collections</Tabs.Trigger>
            </Tabs.List>

            {/* reviews */}
            <Tabs.Content value="reviews">
              {reviewsLoading ? (
                <Flex
                  justify="center"
                  p={8}
                >
                  <Spinner
                    size="lg"
                    color="white"
                  />
                </Flex>
              ) : userReviews.length > 0 ? (
                userReviews.map((review) => (
                  <Review
                    key={review._id}
                    reviewId={review._id ?? ""}
                    rating={review.rating}
                    profilePage={true}
                    usersReview={true}
                    gameId={review.gameId}
                    gameTitle={review.gameTitle}
                    username={user.username}
                    displayName={user.displayName}
                    comment={review.text}
                    canEdit={isSelf}
                    setUserReview={(val) => {
                      if (!val) {
                        setUserReviews((prev) => prev.filter((r) => r._id !== review._id));
                      }
                    }}
                  />
                ))
              ) : (
                <Text>No reviews yet.</Text>
              )}
            </Tabs.Content>

            {/* collections */}
            <Tabs.Content value="collections">
              {collectionsQuery.isLoading && (
                <Flex
                  justify="center"
                  p={8}
                >
                  <Spinner
                    size="lg"
                    color="white"
                  />
                </Flex>
              )}
              {/* Add collection form/button */}
              {!showAddCollectionForm && (
                <Box>
                  <Button
                    w={"100%"}
                    onClick={() => setShowAddCollectionForm(true)}
                  >
                    Add A Collection
                  </Button>
                </Box>
              )}

              {!collectionsQuery.isLoading &&
                (collections && collections.length > 0 ? (
                  collections.map((collection) => (
                    <CollectionSummary
                      key={collection._id}
                      summary={collection}
                      onUpdate={onUpdate}
                      onDelete={() => {
                        queryClient.setQueryData(["getCollectionsByUserId", username], (old: TCollectionSummary[] | undefined) => (old ? old.filter((c) => c._id !== collection._id) : []));
                      }}
                    />
                  ))
                ) : (
                  <Text>No collections yet.</Text>
                ))}
            </Tabs.Content>
          </Tabs.Root>
        )}
      </Flex>
    </div>
  );
};

export default Profile;
