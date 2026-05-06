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
import type { CollectionSummary as TCollectionSummary, ReviewType } from "@/types/types";
import axios from "axios";
import { getCollectionSummariesByUserId } from "../data/collections.ts";
import { getUserByUsername, updateUserProfile } from "../data/users.ts";

//UI IMPORTS//////////////////////////////////////
import Navbar from "@/components/Navbar";
import CollectionSummary from "@/components/Profile/CollectionSummary.tsx";
import ProfileEditButton from "@/components/Profile/ProfileEditButton.tsx";
import Review from "@/components/Reviews/Review";
import { Flex, Box, Avatar, VStack, Text, Separator, Carousel, Tabs, Spinner } from "@chakra-ui/react";
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
  const queryClient = useQueryClient();

  const [currentUser, setCurrentUser] = useState<User>(EMPTY_USER);
  const [userReviews, setUserReviews] = useState<ReviewType[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

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
  });

  const userMutation = useMutation<void, void, ProfileData>({
    mutationFn: (profileData) => updateUserProfile(username, profileData),
    onSuccess: () => queryClient.invalidateQueries(),
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/login");
        return;
      }

      const snap = await getDoc(doc(db, "users", firebaseUser.uid));

      if (snap.exists()) {
        const data = snap.data() as User;
        setCurrentUser(data);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!userQuery.data || userQuery.data.username === "N/A") return;

    async function getUserReviews() {
      try {
        setReviewsLoading(true);

        let { data: reviews } = await axios.get(`http://localhost:3000/api/reviews/user/${userQuery.data.username}`);

        let reviewsWithTitles = await Promise.all(
          reviews.map(async (review: ReviewType) => {
            let { data: game } = await axios.get(`http://localhost:3000/api/games/${review.gameId}`);

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

  if (userQuery.isError) {
    return <NotFoundPage />;
  }

  const user = userQuery.data as User;
  const collections = collectionsQuery.data as TCollectionSummary[] | undefined;
  console.log("Collections: ", collections);
  console.log("Collections query state:", collectionsQuery.status, collectionsQuery.error, collectionsQuery.data);
  // const collections: TCollectionSummary[] = [
  //   {
  //     _id: "1",
  //     name: "Favorites",
  //     gameImages: [
  //       "https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg",
  //       "https://media.rawg.io/media/games/490/49016e06ae2103881ff6373248843069.jpg",
  //       "https://media.rawg.io/media/games/490/49016e06ae2103881ff6373248843069.jpg",
  //       "https://media.rawg.io/media/games/490/49016e06ae2103881ff6373248843069.jpg",
  //       "https://media.rawg.io/media/games/490/49016e06ae2103881ff6373248843069.jpg",
  //       "https://media.rawg.io/media/games/490/49016e06ae2103881ff6373248843069.jpg",
  //       "https://media.rawg.io/media/games/490/49016e06ae2103881ff6373248843069.jpg",
  //       "https://media.rawg.io/media/games/490/49016e06ae2103881ff6373248843069.jpg",
  //       "https://media.rawg.io/media/games/490/49016e06ae2103881ff6373248843069.jpg",
  //       "https://media.rawg.io/media/games/490/49016e06ae2103881ff6373248843069.jpg",
  //       "https://media.rawg.io/media/games/490/49016e06ae2103881ff6373248843069.jpg",
  //       "https://media.rawg.io/media/games/490/49016e06ae2103881ff6373248843069.jpg",
  //       "https://media.rawg.io/media/games/490/49016e06ae2103881ff6373248843069.jpg",
  //       "https://media.rawg.io/media/games/490/49016e06ae2103881ff6373248843069.jpg",
  //       "https://media.rawg.io/media/games/490/49016e06ae2103881ff6373248843069.jpg",
  //       "https://media.rawg.io/media/games/490/49016e06ae2103881ff6373248843069.jpg",
  //     ],
  //   },
  //   {
  //     _id: "2",
  //     name: "Wishlist",
  //     gameImages: ["https://media.rawg.io/media/games/b8c/b8c243eaa0fbac8115e0cdccac3f91dc.jpg"],
  //   },
  // ];

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

              {user.username === currentUser.username && (
                <Flex>
                  <ProfileEditButton
                    initialData={user}
                    onAction={userMutation.mutate}
                  />
                </Flex>
              )}
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

          <Tabs.Content value="collections">
            {collectionsQuery.isLoading ? (
              <Flex
                justify="center"
                p={8}
              >
                <Spinner
                  size="lg"
                  color="white"
                />
              </Flex>
            ) : collections && collections.length > 0 ? (
              collections.map((collection) => (
                <CollectionSummary
                  key={collection._id}
                  summary={collection}
                  onUpdate={() => queryClient.invalidateQueries({ queryKey: ["getCollectionsByUserId", username] })}
                  onDelete={() => {
                    queryClient.setQueryData(["getCollectionsByUserId", username], (old: TCollectionSummary[] | undefined) => (old ? old.filter((c) => c._id !== collection._id) : []));
                  }}
                />
              ))
            ) : (
              <Text>No collections yet.</Text>
            )}
          </Tabs.Content>
        </Tabs.Root>
      </Flex>
    </div>
  );
};

export default Profile;
