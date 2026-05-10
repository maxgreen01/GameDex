import type { QueryClient } from "@tanstack/react-query";
import type { User } from "./types";
import type { AxiosInstance } from "axios";
import toast from "react-hot-toast";

// Update a user's friend data in the cache instead of refetching the entire user.
// Use `options` to specify whether to add to or remove from `friends`, `incomingRequests`, or `outgoingRequests`.
function updateUserFriendsCache(queryClient: QueryClient, user: string, otherUser: string, options: { [key in "friends" | "incomingRequests" | "outgoingRequests"]?: "add" | "remove" | undefined }) {
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
export async function updateIncomingFriendRequest(axiosClient: AxiosInstance, queryClient: QueryClient, currentUser: User | undefined, friend: string, action: "accept" | "decline") {
  if (!currentUser) {
    toast.error("You must be logged in to manage friend requests.");
    return;
  }

  try {
    let successVerb: string;

    switch (action) {
      case "accept":
        await axiosClient.post(`/api/users/${currentUser.username}/friends/${friend}`);
        successVerb = "accepted";
        break;
      case "decline":
        await axiosClient.put(`/api/users/${currentUser.username}/friends/${friend}`);
        successVerb = "declined";
        break;
      default:
        throw new Error(`Invalid action "${action}" for updateIncomingFriendRequest function!`);
    }

    // update the query data for both users to avoid refetching their entire objects

    // even if the action is taken from another user's page, the current user is actually the recipient
    // always remove the invite, and only add to the friends list if the request was accepted
    updateUserFriendsCache(queryClient, currentUser.username, friend, { incomingRequests: "remove", friends: action === "accept" ? "add" : undefined });
    updateUserFriendsCache(queryClient, friend, currentUser.username, { outgoingRequests: "remove", friends: action === "accept" ? "add" : undefined });

    toast.success(`Successfully ${successVerb} friend request!`);
  } catch (e) {
    console.error(`Failed to ${action} friend request:`, e);
    toast.error(`Failed to ${action} friend request.`);
  }
}

// Either send or cancel an outgoing friend request
export async function updateOutgoingFriendRequest(axiosClient: AxiosInstance, queryClient: QueryClient, currentUser: User | undefined, friend: string, action: "send" | "cancel") {
  if (!currentUser) {
    toast.error("You must be logged in to manage friend requests.");
    return;
  }

  try {
    let successVerb: string;

    // the current user is always the sender
    switch (action) {
      case "send":
        await axiosClient.post(`/api/users/${currentUser.username}/friends/${friend}`);
        updateUserFriendsCache(queryClient, currentUser.username, friend, { outgoingRequests: "add" });
        updateUserFriendsCache(queryClient, friend, currentUser.username, { incomingRequests: "add" });
        successVerb = "sent";
        break;
      case "cancel":
        await axiosClient.put(`/api/users/${currentUser.username}/friends/${friend}`);
        updateUserFriendsCache(queryClient, currentUser.username, friend, { outgoingRequests: "remove" });
        updateUserFriendsCache(queryClient, friend, currentUser.username, { incomingRequests: "remove" });
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
export async function removeFriend(axiosClient: AxiosInstance, queryClient: QueryClient, currentUser: User | undefined, friend: string) {
  if (!currentUser) {
    toast.error("You must be logged in to manage friend requests.");
    return;
  }

  try {
    await axiosClient.delete(`/api/users/${currentUser.username}/friends/${friend}`);

    updateUserFriendsCache(queryClient, currentUser.username, friend, { friends: "remove" });
    updateUserFriendsCache(queryClient, friend, currentUser.username, { friends: "remove" });

    toast.success(`Friend "${friend}" removed!`);
  } catch (e) {
    console.error(`Failed to remove friend:`, e);
    toast.error(`Failed to remove friend.`);
  }
}
