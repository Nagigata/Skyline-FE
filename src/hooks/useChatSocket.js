import { useEffect } from "react";
import { socket } from "../services/socket";

export const useChatSocket = ({ user, chat, setChat }) => {
  useEffect(() => {
    if (!socket || !user) return;

    const handleReceiveMessage = ({ userId, metadata }) => {
      if (userId === user._id && metadata.senderId._id !== user._id) {
        const {
          _id,
          senderId,
          receiverId,
          content,
          isRead,
          createdAt,
          feedId,
        } = metadata;

        setChat((prevChat) => {
          if (!prevChat) return prevChat;

          // Kiểm tra xem tin nhắn đã tồn tại chưa
          const existingChat = prevChat.find(
            (friendChat) => friendChat.friendId === senderId._id
          );

          if (existingChat) {
            // Kiểm tra xem tin nhắn đã có trong conversation chưa
            const messageExists = existingChat.conversation.some(
              (msg) => msg._id === _id
            );

            if (messageExists) {
              return prevChat;
            }

            // Cập nhật chat hiện có
            return prevChat.map((friendChat) => {
              if (friendChat.friendId === senderId._id) {
                return {
                  ...friendChat,
                  conversation: [
                    ...friendChat.conversation,
                    {
                      _id,
                      senderId,
                      receiverId,
                      content,
                      isRead,
                      createdAt,
                      feedId,
                    },
                  ],
                };
              }
              return friendChat;
            });
          } else {
            return [
              ...prevChat,
              {
                friendId: senderId._id,
                friendFullname: senderId.fullname,
                friendImageUrl: senderId.profileImageUrl,
                conversation: [
                  {
                    _id,
                    senderId,
                    receiverId,
                    content,
                    isRead,
                    createdAt,
                    feedId,
                  },
                ],
              },
            ];
          }
        });
      }
    };

    const handleReadMessages = ({ userId, metadata }) => {
      if (userId !== user._id) {
        const { messageIds } = metadata;

        setChat((prevChat) => {
          if (!prevChat) return prevChat;

          return prevChat.map((friendChat) => {
            if (friendChat.friendId === userId) {
              const updatedConversation = friendChat.conversation.map(
                (message) => {
                  if (messageIds.includes(message._id)) {
                    return { ...message, isRead: true };
                  }
                  return message;
                }
              );

              return {
                ...friendChat,
                conversation: updatedConversation,
              };
            }
            return friendChat;
          });
        });
      }
    };

    socket.on("send_message", handleReceiveMessage);
    socket.on("read_messages", handleReadMessages);

    return () => {
      socket.off("send_message", handleReceiveMessage);
      socket.off("read_messages", handleReadMessages);
    };
  }, [user, setChat]);

  return socket;
};
