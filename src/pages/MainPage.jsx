import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import Main from "./Main/Main";
import EditFullname from "./Main/EditFullname";
import EditEmail from "./Main/EditEmail";
import EditAvatar from "./Main/EditAvatar";
import EditBirthday from "./Main/EditBirthday";
import EditCountry from "./Main/EditCountry";
import UserProfile from "./Main/UserProfile";
import DeleteAccount from "./Main/DeleteAccount";
import Chat from "./Main/Chat";
import ChatButton from "../components/ChatButton";

const MainPage = ({
  user,
  setUser,
  signInKey,
  signoutHandler,
  chat,
  setChat,
  isLoadingChat,
}) => {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState("main");
  const [numberOfNewMessages, setNumberOfNewMessages] = useState(0);

  const signout = async () => {
    console.log(123);
    setLoading(true);
    await signoutHandler();
    setLoading(false);
  };

  const unSeenMessage = useCallback((friendChat) => {
    console.log(friendChat);
    return friendChat.conversation.some(
      (message) =>
        message.isRead === false && message.receiverId._id === user._id
    );
  }, []);

  useEffect(() => {
    if (!chat) return;
    let count = 0;
    chat.forEach((friendChat) => {
      if (unSeenMessage(friendChat)) count++;
    });
    setNumberOfNewMessages(count);
  }, [chat]);

  return (
    <div className="bg-zinc-900 w-full h-svh relative flex justify-end flex-col items-center">
      {page !== "chat" && (
        <div className="absolute top-24 right-4 z-30">
          <ChatButton
            clickHandler={() => setPage("chat")}
            isLoadingChat={isLoadingChat}
            numberOfNewMessage={numberOfNewMessages}
          />
        </div>
      )}
      <Navbar user={user} setPage={setPage} signoutHandle={signout} />
      {page === "main" && (
        <Main
          user={user}
          setUser={setUser}
          signInKey={signInKey}          
          signout={signout}
          setChat={setChat}
        />
      )}
      {page === "chat" && (
        <Chat
          user={user}
          signInKey={signInKey}
          setUser={setUser}
          chat={chat}
          setChat={setChat}
        />
      )}
      {page === "profile" && (
        <UserProfile
          user={user}
          signInKey={signInKey}
          setUser={setUser}
          setLoading={setLoading}
        />
      )}
      {page === "edit-fullname" && (
        <EditFullname user={user} signInKey={signInKey} setUser={setUser} />
      )}
      {page === "edit-email" && (
        <EditEmail user={user} signInKey={signInKey} setUser={setUser} />
      )}
      {page === "edit-birthday" && (
        <EditBirthday user={user} signInKey={signInKey} setUser={setUser} />
      )}
       {page === "edit-country" && (
        <EditCountry user={user} signInKey={signInKey} setUser={setUser} />
      )}
      {page === "edit-avatar" && (
        <EditAvatar user={user} signInKey={signInKey} setUser={setUser} />
      )}
      {page === "delete" && (
        <DeleteAccount signout={signout} user={user} signInKey={signInKey} />
      )}

      {loading && <Loading />}
    </div>
  );
};

export default MainPage;
