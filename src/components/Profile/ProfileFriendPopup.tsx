//IMPORTS////////////////////////////////////////
import { Link } from "react-router-dom";
//UI IMPORTS//////////////////////////////////////
import { Box, Center, HStack, IconButton, Popover, Portal, Spacer, Text, VStack } from "@chakra-ui/react";
import { MdNotInterested, MdPersonAdd, MdPersonRemove } from "react-icons/md";
import { Tooltip } from "../ui/tooltip";

interface Props {
  data: string[]; // list of friend usernames (either friends or incoming friend requests, depending on the context)
  isRequests?: boolean; // true if this is for the requests popup
  username: string; // current user's username
  isSelf: boolean; // true if this is the current user's profile
  isOpen: boolean;
  onOpenChange: (open: Popover.OpenChangeDetails) => void;
  updateData(friend: string, action: string): void; // function to update the friend data in the parent component when a friend is accepted/declined/removed
}

// Popup that shows either the user's friends or incoming friend requests, depending on the context
function ProfileFriendPopup({ data, isRequests, username, isSelf, isOpen, onOpenChange, updateData }: Props) {
  return (
    <Popover.Root
      size={"sm"}
      open={isOpen}
      onOpenChange={onOpenChange}
      autoFocus={false}
    >
      <Tooltip
        showArrow
        content={`View Friend${isRequests ? " Requests" : "s"}`}
      >
        {/* wrap trigger to isolate tooltip and popover events */}
        <Box display="inline-block">
          <Popover.Trigger asChild>
            <VStack gap={0}>
              <Text>{isRequests ? "Friend Requests" : "Friends"}</Text>
              <Text>{data.length ?? 0}</Text>
            </VStack>
          </Popover.Trigger>
        </Box>
      </Tooltip>
      <Portal>
        <Popover.Positioner>
          <Popover.Content w={"250px"}>
            <Popover.Arrow />
            <Popover.Body>
              {data.length ? (
                <>
                  <Popover.Title fontWeight="medium">{isRequests ? "Incoming Friend Requests" : `${isSelf ? "Your" : `${username}'s`} Friends`}</Popover.Title>
                  <VStack>
                    {data.map((friend) => {
                      return (
                        <HStack
                          key={friend}
                          width="80%"
                        >
                          <Link to={`/profile/${friend}`}>{friend}</Link>

                          {/* push buttons to the right side */}
                          <Spacer />

                          {/* action buttons - only show if this is the current user's profile */}
                          {isSelf && (
                            <>
                              {isRequests ? (
                                <>
                                  {/* if this is an incoming friend request, show accept/decline buttons */}
                                  <Tooltip
                                    showArrow
                                    content="Accept"
                                  >
                                    <IconButton
                                      onClick={() => updateData(friend, "accept")}
                                      variant="ghost"
                                    >
                                      <MdPersonAdd />
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip
                                    showArrow
                                    content="Decline"
                                  >
                                    <IconButton
                                      onClick={() => updateData(friend, "decline")}
                                      variant="ghost"
                                    >
                                      <MdNotInterested />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              ) : (
                                // if this is a friend, only show remove button
                                <Tooltip
                                  showArrow
                                  content="Remove Friend"
                                >
                                  <IconButton
                                    onClick={() => updateData(friend, "delete")}
                                    variant="ghost"
                                  >
                                    <MdPersonRemove />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </>
                          )}
                        </HStack>
                      );
                    })}
                  </VStack>
                </>
              ) : (
                <Center>
                  <Text>{isRequests ? "No incoming friend requests" : "No friends :("}</Text>
                </Center>
              )}
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}

export default ProfileFriendPopup;
