import { useEffect } from "react";
import { socket } from "../services/socket";

export const useFriendSocket = ({ user, setUser }) => {
  useEffect(() => {
    if (!socket || !user) return;

    const handleSendInvite = ({ userId, metadata }) => {
      if (userId === user._id) {
        setUser((prevUser) => ({
          ...prevUser,
          friendInvites: [
            ...prevUser.friendInvites,
            {
              _id: metadata._id,
              createdAt: metadata.createdAt,
              sender: metadata.sender,
              receiver: metadata.receiver,
            },
          ],
        }));
      }
    };

    const handleRemoveInvite = ({ userId, metadata }) => {
      if (userId === user._id) {
        setUser((prevUser) => ({
          ...prevUser,
          friendInvites: prevUser.friendInvites.filter(
            (invite) => invite._id !== metadata._id
          ),
        }));
      }
    };

    const handleAcceptInvite = ({ userId, metadata }) => {
      if (userId === user._id) {
        setUser((prevUser) => {
          // Remove the invite
          const updatedInvites = prevUser.friendInvites.filter(
            (invite) => invite._id !== metadata.friendInviteId
          );

          // Add new friend
          return {
            ...prevUser,
            friendInvites: updatedInvites,
            friendList: [...prevUser.friendList, metadata.friend],
          };
        });
      }
    };

    const handleDeleteFriend = ({ userId, metadata }) => {
      if (userId === user._id) {
        setUser((prevUser) => ({
          ...prevUser,
          friendList: prevUser.friendList.filter(
            (friend) => friend._id !== metadata._id
          ),
        }));
      }
    };

    // Subscribe to socket events
    socket.on("send_invite", handleSendInvite);
    socket.on("remove_invite", handleRemoveInvite);
    socket.on("accept_invite", handleAcceptInvite);
    socket.on("delete_friend", handleDeleteFriend);

    return () => {
      socket.off("send_invite", handleSendInvite);
      socket.off("remove_invite", handleRemoveInvite);
      socket.off("accept_invite", handleAcceptInvite);
      socket.off("delete_friend", handleDeleteFriend);
    };
  }, [user, setUser]);

  return socket;
};
