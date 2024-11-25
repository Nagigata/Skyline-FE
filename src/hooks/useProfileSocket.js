import { useEffect } from "react";
import { socket } from "../services/socket";

export const useProfileSocket = ({ user, setUser }) => {
  useEffect(() => {
    if (!socket || !user) return;

    const handleFullnameChange = ({ userId, metadata }) => {
      if (!user.friendList && !user.friendInvites) return;

      setUser((prevUser) => {
        const updatedFriendList = prevUser.friendList.map((friend) => {
          if (friend._id === userId) {
            return {
              ...friend,
              fullname: metadata.fullname,
              profileImageUrl: metadata.profileImageUrl,
            };
          }
          return friend;
        });

        const updatedFriendInvites = prevUser.friendInvites.map((invite) => {
          if (invite.sender._id === userId) {
            return {
              ...invite,
              sender: {
                ...invite.sender,
                fullname: metadata.fullname,
                profileImageUrl: metadata.profileImageUrl,
              },
            };
          }
          if (invite.receiver._id === userId) {
            return {
              ...invite,
              receiver: {
                ...invite.receiver,
                fullname: metadata.fullname,
                profileImageUrl: metadata.profileImageUrl,
              },
            };
          }
          return invite;
        });

        return {
          ...prevUser,
          friendList: updatedFriendList,
          friendInvites: updatedFriendInvites,
        };
      });
    };

    const handleProfileImageChange = ({ userId, metadata }) => {
      if (!user.friendList && !user.friendInvites) return;

      setUser((prevUser) => {
        // Update in friend list
        const updatedFriendList = prevUser.friendList.map((friend) => {
          if (friend._id === userId) {
            console.log(metadata.profileImageUrl)
            return {
              ...friend,
              profileImageUrl: metadata.profileImageUrl,
            };
          }
          return friend;
        });

        // Update in friend invites (both sender and receiver)
        const updatedFriendInvites = prevUser.friendInvites.map((invite) => {
          if (invite.sender._id === userId) {
            return {
              ...invite,
              sender: {
                ...invite.sender,
                profileImageUrl: metadata.profileImageUrl,
              },
            };
          }
          if (invite.receiver._id === userId) {
            return {
              ...invite,
              receiver: {
                ...invite.receiver,
                profileImageUrl: metadata.profileImageUrl,
              },
            };
          }
          return invite;
        });

        return {
          ...prevUser,
          friendList: updatedFriendList,
          friendInvites: updatedFriendInvites,
        };
      });
    };

    socket.on("change_fullname", handleFullnameChange);
    socket.on("change_profile_image", handleProfileImageChange);

    return () => {
      socket.off("change_fullname", handleFullnameChange);
      socket.off("change_profile_image", handleProfileImageChange);
    };
  }, [user, setUser]);

  return socket;
};
