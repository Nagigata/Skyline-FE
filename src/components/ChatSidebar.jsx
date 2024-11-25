import React, { useCallback } from "react";
import FriendChatBar from "./FriendChatBar";

const ChatSidebar = ({ chat, selectedFriendId, setSelectedFriendId, user }) => {
  const unSeenMessage = useCallback((friendChat) => {
    return friendChat.conversation.some(
      (message) =>
        message.isRead === false && message.receiverId._id === user._id
    );
  }, []);

  const getMessageDetails = (friendChat) => {
    const friend = user.friendList.find((f) => f._id === friendChat.friendId);
    if (friendChat.conversation.length === 0) {
      return {
        imageUrl: friend.profileImageUrl,
        fullname: friend.fullname,
      };
    }

    const lastMessage =
      friendChat.conversation[friendChat.conversation.length - 1];

    return {
      imageUrl: friend.profileImageUrl,
      fullname: friend.fullname,
      message: lastMessage.content,
      sendTime: lastMessage.createdAt,
    };
  };

  const sortedChat = [...chat].sort((a, b) => {
    const aLastMessage = a.conversation[a.conversation.length - 1];
    const bLastMessage = b.conversation[b.conversation.length - 1];
    
    if (!aLastMessage) return 1;
    if (!bLastMessage) return -1;
    
    return new Date(bLastMessage.createdAt) - new Date(aLastMessage.createdAt);
  });

  return (
    <div className="h-[calc(100vh_-_60px)] max-h-[calc(100vh_-_60px)] w-[250px] max-w-[250px] bg-zinc-900">
      <div className="flex items-center h-[50px]">
        <p className="text-[18px] text-gray pl-[20px] semibold">Chats</p>
      </div>
      <div className="h-[calc(100vh_-_110px)] max-h-[calc(100vh_-_60px)] w-[250px] max-w-[250px] overflow-hidden overflow-y-auto flex flex-col justify-start items-center p-2 pl-[20px]">
        {sortedChat.map((friendChat) => {
          const details = getMessageDetails(friendChat);

          return (
            <div
              key={friendChat.friendId}
              className="cursor-pointer w-full"
              onClick={() => {
                setSelectedFriendId(friendChat.friendId);
              }}
            >
              <FriendChatBar
                id={friendChat.friendId}
                imageUrl={details.imageUrl}
                fullname={details.fullname}
                isNew={unSeenMessage(friendChat)}
                selectedFriendId={selectedFriendId}
                message={details.message}
                sendTime={details.sendTime}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatSidebar;