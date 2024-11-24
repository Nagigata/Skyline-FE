import { useState, useEffect } from "react";
import "./App.css";
import Auth from "./pages/Auth";
import MainPage from "./pages/MainPage";
import LandingPage from "./components/AddFriend";
import Cookies from "js-cookie";
import IO from "socket.io-client";
import { useSearchParams } from "react-router-dom";

const socket = IO("https://skn7vgp9-10005.asse.devtunnels.ms");

function App() {
  const [searchParams] = useSearchParams();
  const [firstLoad, setFirstLoad] = useState(true);
  const [auth, setAuth] = useState(false);
  const [user, setUser] = useState(JSON.parse(Cookies.get("user") || null));
  const [chat, setChat] = useState(JSON.parse(null));
  const [signInKey, setSignInKey] = useState(Cookies.get("signInKey") || null);
  const [error, setError] = useState(null);
  const [isLoadingChat, setIsLoadingChat] = useState(true);
  const [justSignIn, setJustSignIn] = useState(false);

  useEffect(() => {
    console.log({ error });
  }, [error]);
  console.log(user, chat, signInKey);
  useEffect(() => {
    if (auth && (!user || !chat || !signInKey)) {
      signoutHandler();
    }
  }, []);

  useEffect(() => {
    if (user) {
      Cookies.set("user", JSON.stringify(user), {
        secure: true,
        sameSite: "Strict",
      });
    }
    if (signInKey) {
      Cookies.set("signInKey", signInKey, {
        secure: true,
        sameSite: "Strict",
      });
    }
  }, [user, signInKey]);

  useEffect(() => {
    if (user && signInKey) {
      setAuth(true);
    } else {
      setAuth(false);
    }
  }, [user, signInKey]);

  useEffect(() => {
    (async () => {
      if (firstLoad && auth) {
        const newUser = await getUserInfor();
        if (!newUser) return;
        setUser(newUser);
        setFirstLoad(false);
      }
      if (auth) {
        setIsLoadingChat(true);
        const newChat = await getChat();
        if (!newChat) return;
        setChat(newChat);
        setIsLoadingChat(false);
      }
    })();
  }, [auth]);

  useEffect(() => {
    (async () => {
      if (justSignIn && auth) {
        setIsLoadingChat(true);
        const newChat = await getChat();
        if (!newChat) return;
        setChat(newChat);
        setIsLoadingChat(false);
        setJustSignIn(false);
      }
    })();
  }, [auth, justSignIn]);

  useEffect(() => {
    if (chat && user) {
      const handleSocketEvent = async (data) => {
        //if don't load user and chat yet => cancel
        if (!user || !chat) return;
        console.log(data);
        //check action
        if (data.action === "sent") {
          const infor = data.data;
          //check user is receiver
          if (user._id !== infor.receiverId) return;
          //set new message from friend
          setChat((chat) => {
            return chat.map((friendChat) => {
              if (friendChat.friendId === infor.senderId) {
                friendChat.conversation.push(infor.message);
              }
              return friendChat;
            });
          });
        } else {
          return;
        }
      };

      // Đăng ký sự kiện khi component mount
      socket.on("message", handleSocketEvent);

      // Hủy đăng ký sự kiện khi component unmount
      return () => {
        socket.off("message", handleSocketEvent);
      };
    }
  }, [chat, user]);

  useEffect(() => {
    if (user && signInKey) {
      const handleSocketEvent = async (data) => {
        if (!user) return;
        console.log(data);
        if (data.action === "friend") {
          if (data.userId !== user._id) {
            return;
          }
        } else if (data.action === "user") {
          if (!data.userList.some((i) => i.toString() === user._id)) {
            return;
          }
        } else if (data.action === "accept friend") {
          if (!data.userList.some((i) => i.toString() === user._id)) {
            return;
          }
        } else {
          return;
        }
        try {
          const gotUser = await getUserInfor();
          setUser(gotUser);
          if (data.action === "accept friend") {
            console.log("hehe");
            const gotChat = await getChat();
            setChat(gotChat);
          }
        } catch (error) {
          console.log(error);
        }
      };

      // Đăng ký sự kiện khi component mount
      socket.on("user", handleSocketEvent);

      // Hủy đăng ký sự kiện khi component unmount
      return () => {
        socket.off("user", handleSocketEvent);
      };
    }
  }, [user, signInKey]);

  const hasLandingParams = Boolean(
    searchParams.get("_id") &&
      searchParams.get("fullname") &&
      searchParams.get("profileImageUrl")
  );

  const getUserInfor = async () => {
    try {
      const response = await fetch(
        `https://skn7vgp9-10000.asse.devtunnels.ms/api/user`,
        {
          method: "GET",
          headers: {
            "x-api-key": "abc-xyz-www",
            "Content-Type": "application/json",
            authorization: signInKey,
          },
        }
      );
      const data = await response.json();
      console.log(data);
      return data.metadata;
    } catch (error) {
      setError(error);
      return null;
    }
  };

  const getChat = async () => {
    try {
      const response = await fetch(
        "https://skn7vgp9-10000.asse.devtunnels.ms/api/message/all",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "abc-xyz-www",
            authorization: signInKey,
          },
        }
      );

      const data = await response.json();

      if (data.status === 200) {
        console.log("Chat data:", data);
        return data.metadata;
      } else {
        throw new Error(data.message || "Failed to get chat messages");
      }
    } catch (error) {
      setError(error);
      return null;
    }
  };

  const signoutHandler = async () => {
    Cookies.remove("user");
    Cookies.remove("signInKey");
    setSignInKey(null);
    setUser(null);
    setChat(null);
    setError(null);
    setAuth(false);
  };

  return (
    <div>
      {auth ? (
        hasLandingParams ? (
          <LandingPage user={user} setUser={setUser} signInKey={signInKey} />
        ) : (
          <MainPage
            user={user}
            setUser={setUser}
            signInKey={signInKey}
            signoutHandler={signoutHandler}
            chat={chat}
            setChat={setChat}
            isLoadingChat={isLoadingChat}
          />
        )
      ) : (
        <Auth
          setUser={setUser}
          setSignInKey={setSignInKey}
          setJustSignIn={setJustSignIn}
        />
      )}
    </div>
  );
}

export default App;
