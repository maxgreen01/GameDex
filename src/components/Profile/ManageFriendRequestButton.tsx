import type { FC } from "react";
import type { User } from "../../../shared/types";
import { Flex, Button, Text } from "@chakra-ui/react";
import { MdPersonAdd, MdNotInterested, MdGroupAdd } from "react-icons/md";
import type { AxiosInstance } from "axios";
import type { QueryClient } from "@tanstack/react-query";
import { updateIncomingFriendRequest, updateOutgoingFriendRequest } from "../../../shared/friendLogic";

interface Props {
  currentUser: User;
  otherUser: string; // the other user's username
  axiosClient: AxiosInstance;
  queryClient: QueryClient;
}

function ManageFriendRequestButton({ currentUser, otherUser, axiosClient, queryClient }: Props) {
  return (
    <>
      {currentUser.username &&
        currentUser.username !== otherUser &&
        !currentUser.friends?.includes(otherUser) &&
        (currentUser.incomingRequests?.includes(otherUser) ? (
          // current user has an incoming request from this profile user, so show accept button
          <Flex>
            <Button
              onClick={() => updateIncomingFriendRequest(axiosClient, queryClient, currentUser, otherUser, "accept")}
              variant="outline"
            >
              <MdPersonAdd /> <Text>Accept Friend Request</Text>
            </Button>
          </Flex>
        ) : currentUser?.outgoingRequests?.includes(otherUser) ? (
          // outgoing request exists, so show cancel button
          <Flex>
            <Button
              onClick={() => updateOutgoingFriendRequest(axiosClient, queryClient, currentUser, otherUser, "cancel")}
              variant="outline"
            >
              <MdNotInterested /> <Text>Cancel Friend Request</Text>
            </Button>
          </Flex>
        ) : (
          // send a new request
          <Flex>
            <Button
              onClick={() => updateOutgoingFriendRequest(axiosClient, queryClient, currentUser, otherUser, "send")}
              variant="outline"
            >
              <MdGroupAdd /> <Text>Send Friend Request</Text>
            </Button>
          </Flex>
        ))}
    </>
  );
}

export default ManageFriendRequestButton;
