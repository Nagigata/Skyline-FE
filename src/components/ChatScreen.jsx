import React, { useRef, useEffect, useState } from "react";
import FeedChat from "./FeedChat";
import ChatBar from "./ChatBar";
import { gsap } from "gsap";
import { useChatSocket } from "../hooks/useChatSocket";
const ChatScreen = ({ chat, selectedFriendId, setChat, user, signInKey }) => {
  const [message, setMessage] = useState("");
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [sending, setSending] = useState(false);
  const chatContainerRef = useRef(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loadedAllMessages, setLoadedAllMessages] = useState(false);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const loadingRef = useRef(null);
  const previousHeightRef = useRef(null);

  const loadedAllMessagesRef = useRef(loadedAllMessages);
  const loadingMoreMessagesRef = useRef(loadingMoreMessages);
  
  useChatSocket({ user, chat, setChat });

  // Reset states when changing users
  useEffect(() => {
    setIsFirstLoad(true);
    setLoadedAllMessages(false);
    setLoadingMoreMessages(false);
    loadedAllMessagesRef.current = false;
    loadingMoreMessagesRef.current = false;
    previousHeightRef.current = null;
  }, [selectedFriendId]);

  useEffect(() => {
    loadedAllMessagesRef.current = loadedAllMessages;
  }, [loadedAllMessages]);

  useEffect(() => {
    loadingMoreMessagesRef.current = loadingMoreMessages;
  }, [loadingMoreMessages]);

  useEffect(() => {
    const newSelectedChat = chat.find((friendChat) => friendChat.friendId === selectedFriendId);
    setSelectedChat(newSelectedChat);
  }, [selectedFriendId, chat]);

  useEffect(() => {
    if (!selectedChat || !chatContainerRef.current) return;

    const chatContainer = chatContainerRef.current;

    // Scroll to bottom on first load or when sending new message
    if (isFirstLoad) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
      setIsFirstLoad(false);
      return;
    }

    const handleScroll = async () => {
      if (loadedAllMessagesRef.current || loadingMoreMessagesRef.current) return;
      
      if (chatContainer.scrollTop === 0) {
        previousHeightRef.current = chatContainer.scrollHeight;
        await getMoreMessages();
      }
    };

    chatContainer.addEventListener("scroll", handleScroll);
    return () => chatContainer.removeEventListener("scroll", handleScroll);
  }, [selectedChat, isFirstLoad]);

  // Scroll to bottom after loading more messages
  useEffect(() => {
    if (!chatContainerRef.current || !previousHeightRef.current) return;

    const chatContainer = chatContainerRef.current;
    if (previousHeightRef.current) {
      const newHeight = chatContainer.scrollHeight;
      const heightDiff = newHeight - previousHeightRef.current;
      chatContainer.scrollTop = heightDiff;
      previousHeightRef.current = null;
    }
  }, [selectedChat?.conversation]);

  // Scroll to bottom after sending a new message
  useEffect(() => {
    if (!chatContainerRef.current) return;
    
    const chatContainer = chatContainerRef.current;
    const isNearBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 100;
    
    if (isNearBottom) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [selectedChat?.conversation.length]);

  useEffect(() => {
    if (!selectedChat) return;

    const unSeenMessageIds = selectedChat.conversation
      .filter((message) => {
        if (!message.isRead && message.receiverId._id === user._id) {
          return true;
        }
      })
      .map((message) => message._id);

    console.log(unSeenMessageIds);

    if (unSeenMessageIds.length > 0) {
      const markMessagesAsRead = async () => {
        try {
          await readMessages(unSeenMessageIds);
        } catch (error) {
          console.error("Error marking messages as read:", error);
        }
      };

      markMessagesAsRead();
    }
  }, [selectedChat, chat]);

  // New useEffect for loading animation
  useEffect(() => {
    if (loadingMoreMessages && loadingRef.current) {
      const tween = gsap.to(loadingRef.current, {
        rotation: 360,
        duration: 1,
        repeat: -1,
        ease: "linear",
      });

      return () => {
        tween.kill(); // Stop the animation when the component unmounts or loadingMoreMessages becomes false
      };
    }
  }, [loadingMoreMessages]);

  const getMoreMessages = async () => {
    if (loadedAllMessagesRef.current || loadingMoreMessagesRef.current) return;
    try {
      loadingMoreMessagesRef.current = true;
      setLoadingMoreMessages(true);

      const response = await fetch(
        `https://skn7vgp9-10000.asse.devtunnels.ms/api/message/certain/${selectedChat.friendId}?skip=${selectedChat.conversation.length}`,
        {
          method: "GET",
          headers: {
            "x-api-key": "abc-xyz-www",
            authorization: signInKey,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch messages:", errorData.message);
        throw new Error(errorData.message);
      }

      const data = await response.json();

      if (!data.metadata || data.metadata.length === 0) {
        loadedAllMessagesRef.current = true;
        setLoadedAllMessages(true);
        return;
      }

      setChat((prevChat) =>
        prevChat.map((friendChat) => {
          if (friendChat.friendId === selectedChat.friendId) {
            return {
              ...friendChat,
              conversation: [...data.metadata, ...friendChat.conversation],
            };
          }
          return friendChat;
        })
      );
    } catch (error) {
      console.error("Error fetching more messages:", error);
    } finally {
      loadingMoreMessagesRef.current = false;
      setLoadingMoreMessages(false);
    }
  };
  const readMessages = async (messageIds) => {
    try {
      const response = await fetch(
        "https://skn7vgp9-10000.asse.devtunnels.ms/api/message/read",
        {
          method: "PATCH",
          headers: {
            "x-api-key": "abc-xyz-www",
            authorization: signInKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messageIds: messageIds,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 200) {
        console.log(data);
        setChat((chat) => {
          return chat.map((friendChat) => {
            if (friendChat.friendId === selectedFriendId) {
              friendChat.conversation = friendChat.conversation.map(
                (message) => {
                  if (messageIds.includes(message._id)) {
                    return { ...message, isRead: true };
                  }
                  return message;
                }
              );
            }
            return friendChat;
          });
        });
      } else {
        console.error("Failed to read messages:", data.message);
      }
    } catch (error) {
      console.error("Error reading messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return; // Prevent sending empty messages

    try {
      setSending(true);
      const response = await fetch(
        "https://skn7vgp9-10000.asse.devtunnels.ms/api/message",
        {
          method: "POST",
          headers: {
            "x-api-key": "abc-xyz-www",
            authorization: signInKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            receiverId: selectedChat.friendId,
            content: message,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 201) {
        console.log(data);
        setChat((chat) => {
          return chat.map((friendChat) => {
            if (friendChat.friendId === selectedChat.friendId) {
              friendChat.conversation.push(data.metadata);
            }
            return friendChat;
          });
        });
        setMessage("");
      } else {
        console.error("Failed to send message:", data.message);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const getMessageDetails = (friendChat) => {
    const friend = user.friendList.find((f) => f._id === friendChat.friendId);
    if (friendChat.conversation.length === 0) {
      return {
        imageUrl: friend.profileImageUrl,
        fullname: friend.fullname,
      };
    }

    console.log(friendChat.friendId);
    console.log(user.friendList);
    return {
      imageUrl: friend.profileImageUrl,
      fullname: friend.fullname,
    };
  };

  return (
    <div className="bg-zinc-800 h-[calc(100vh_-_60px)] max-h-[calc(100vh_-_60px)] w-[calc(100vw_-_250px)] overflow-hidden border-l-2 border-t-2 border-zinc-800 flex flex-col">
      {selectedChat ? (
        <>
          <div className="w-full h-[50px] bg-primary bg-opacity-90 flex items-center border-b-2 border-zinc-900 pl-3 py-2 z-10">
            {(() => {
              const details = getMessageDetails(selectedChat);
              return (
                <>
                  <img
                    src={details.imageUrl}
                    alt={details.fullname}
                    className="w-9 h-9 rounded-full mr-2"
                  />
                  <span className="text-white text-sm medium">
                    {details.fullname}
                  </span>
                </>
              );
            })()}
          </div>

          <div
            ref={chatContainerRef}
            className="flex-grow overflow-y-auto"
          >
            <div className="p-2 flex flex-col">
              {loadingMoreMessages && (
                <div className="flex justify-center">
                  <img
                    ref={loadingRef}
                    src="/assets/images/loadingCircle.png"
                    alt="loading"
                    className="w-6"
                  />
                </div>
              )}
              {selectedChat.conversation.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${
                    message.senderId._id === selectedFriendId
                      ? "justify-start"
                      : "justify-end"
                  } mb-4`}
                >
                  <div
                    className={`semibold ${
                      message.senderId._id === selectedFriendId
                        ? "bg-zinc-900 bg-opacity-70 text-white"
                        : "bg-zinc-200 bg-opacity-80 text-primary"
                    } p-3 rounded-3xl max-w-xs`}
                  >
                    <p className="text-sm text-left">{message.content}</p>
                    {message.feedId && (
                      <FeedChat
                        feed={message.feedId}
                        user={user}
                        // friend={{
                        //   friendId: selectedFriendId,
                        //   friendImageUrl:
                        //     message.senderId._id == user._id
                        //       ? message.senderId.profileImageUrl
                        //       : message.receiverId.profileImageUrl,
                        //   friendFullname:
                        //     message.senderId._id == user._id
                        //       ? message.senderId.fullname
                        //       : message.receiverId.fullname,
                        // }}
                        createdAt={message.createdAt}
                        senderId={message.senderId._id}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full">
            <ChatBar
              message={message}
              setMessage={setMessage}
              sendMessage={sendMessage}
              sending={sending}
            />
          </div>
        </>
      ) : (
        <div className="text-white text-center mt-20">
          Select a friend to start chatting.
        </div>
      )}
    </div>
  );
};

export default ChatScreen;