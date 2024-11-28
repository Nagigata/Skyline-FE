import React, { useState, useEffect, useRef } from "react";
import FriendSelection from "../../components/FriendSelection";
import Button from "../../components/Button";
import gsap from "gsap";
import CreateFeed from "./CreateFeed";
import Feed from "../../components/Feed";
import ReactBar from "../../components/ReactBar";

import { useFeedSocket } from "../../hooks/useFeedSocket";
import { useChatSocket } from "../../hooks/useChatSocket";
import { useFriendSocket } from "../../hooks/useFriendSocket";
import { useProfileSocket } from "../../hooks/useProfileSocket";

const isVisible = (visibility, userId) => {
  if (Array.isArray(visibility)) {
    return visibility.includes(userId);
  } else {
    return true;
  }
};

const Main = ({ user, setUser, signInKey, signout, setChat }) => {
  const contentRef = useRef(null);
  const reactBarRef = useRef(null);
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [maxFeed, setMaxFeed] = useState(-1);
  const [currentFeed, setCurrentFeed] = useState(null);
  const [editing, setEditing] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [editDescription, setEditDescription] = useState("");
  const [editSendTo, setEditSendTo] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showReloadPopup, setShowReloadPopup] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);
  const [comment, setComment] = useState("");
  const [selectedUser, setSelectedUser] = useState({
    id: "everyone",
    fullname: "Everyone",
  });
  const [turnOffCamera, setTurnOffCamera] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useFeedSocket({ user, feeds, setFeeds });
  useChatSocket({ user, setChat });
  useFriendSocket({ user, setUser });
  useProfileSocket({ user, setUser });
  useEffect(() => {
    if (page === 0) {
      setTurnOffCamera(false);
    } else {
      setTurnOffCamera(true);
    }
  }, [page, turnOffCamera]);

  useEffect(() => {
    if (!currentFeed) return;
    setEditDescription(currentFeed.description);
    setEditSendTo(
      currentFeed.visibility === "everyone" ? [] : currentFeed.visibility
    );
  }, [currentFeed]);

  useEffect(() => {
    const content = contentRef.current;
    gsap.fromTo(content, { opacity: 0 }, { opacity: 1, duration: 1 });
  }, []);

  const sendMessage = async (receiverId, comment, feedId) => {
    try {
      setSendingComment(true);

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
            receiverId,
            content: comment,
            feedId,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 201) {
        console.log("Comment sent successfully:", data);
        console.log();
        // Update chat state correctly using the receiverId
        setChat((prevChat) => {
          console.log(prevChat);
          if (!prevChat) return prevChat;

          return prevChat.map((friendChat) => {
            if (friendChat.friendId === receiverId) {
              return {
                ...friendChat,
                conversation: [...friendChat.conversation, data.metadata],
              };
            }
            return friendChat;
          });
        });
      } else {
        console.error("Failed to send comment:", data.message);
        throw new Error(data.message || "Failed to send comment");
      }
    } catch (error) {
      console.error("Error sending comment:", error);
      throw error;
    } finally {
      setIsCommenting(false);
      setComment("");
      setSendingComment(false);
    }
  };

  const fetchFeeds = async (page) => {
    console.log("Request details:", {
      url:  `https://skn7vgp9-10000.asse.devtunnels.ms/api/feed/everyone?skip=${feeds.length}`,
      signInKey,
    });
    if (maxFeed === -1 && page >= feeds.length - 10 && !loading) {
      console.log(feeds.length);
      console.log(signInKey);
      try {
        if (feeds.length == 0) setLoading(true);
        const response = await fetch(
          `https://skn7vgp9-10000.asse.devtunnels.ms/api/feed/everyone?skip=${feeds.length}`,
          {
            method: "GET",
            headers: {
              "x-api-key": "abc-xyz-www",
              authorization: signInKey,
            },
          }
        );
        const data = await response.json();
        console.log(data);
        if (response.ok) {
          if (data.metadata.length == 0) {
            setMaxFeed(feeds.length);
            console.log(1);
          } else {
            setFeeds((prevFeeds) => {
              const newFeeds = data.metadata.filter(
                (newFeed) =>
                  !prevFeeds.some(
                    (existingFeed) => existingFeed._id === newFeed._id
                  )
              );
              return [...prevFeeds, ...newFeeds];
            });
            console.log(2);
          }
        } else {
          if (data.message === "User ID does not match token") {
            signout();
          }
          console.error("Failed to fetch feeds:", data.message);
        }
      } catch (error) {
        console.error("Error fetching feeds:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchCertainFeeds = async (page, userId) => {
    if (maxFeed === -1 && page >= feeds.length - 10 && !loading) {
      try {
        console.log(feeds.length);
        if (feeds.length == 0) setLoading(true);
        const response = await fetch(
          `https://skn7vgp9-10000.asse.devtunnels.ms/api/feed/certain/${userId}?skip=${feeds.length}`,
          {
            method: "GET",
            headers: {
              "x-api-key": "abc-xyz-www",
              authorization: signInKey,
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          if (data.metadata.length == 0) {
            setMaxFeed(feeds.length);
          } else {
            setFeeds((prevV) => [...prevV, ...data.metadata]);
          }
        } else {
          if (data.message === "User ID does not match token") {
            signout();
          }
          console.error("Failed to fetch feeds:", data.message);
        }
      } catch (error) {
        console.error("Error fetching feeds:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (selectedUser.id === "everyone") {
      fetchFeeds(page);
    } else {
      console.log("1");
      fetchCertainFeeds(page, selectedUser.id);
    }
  }, [page, feeds, loading]);

  const handleScroll = (direction) => {
    if (contentRef.current && !loading) {
      setEditing(false);
      setLoading(true); // Chặn cuộn khi đang cuộn
      setIsCommenting(false);
      setComment("");
      setPage((oldV) => (oldV === 0 && direction < 0 ? 0 : oldV + direction));
      const scrollAmount = direction * window.innerHeight;
      contentRef.current.scrollBy({ top: scrollAmount, behavior: "smooth" });
      setTimeout(() => {
        setLoading(false);
      }, 500); // 500ms là thời gian ước lượng cho hành động cuộn hoàn tất
    }
  };

  useEffect(() => {
    page !== 0 && setCurrentFeed(feeds[page - 1]);
  }, [page, feeds]);

  const handleTakePhotoBtn = () => {
    setLoading(true);
    setEditing(false);
    setIsCommenting(false);
    setComment("");
    contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      setLoading(false);
    }, 500);
    setPage(0);
    setLoading(false);
  };

  const handleKeyDown = (event) => {
    switch (event.key) {
      case "ArrowUp":
        handleScroll(-1);
        break;
      case "ArrowDown":
        handleScroll(1);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (page !== 0 && reactBarRef.current) {
      gsap.fromTo(
        reactBarRef.current,
        { y: 300, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2 }
      );
    }
  }, [page]);

  const handleReloadFeeds = () => {
    console.log("reload feed");
    setEditing(false);
    setPage(0);
    setFeeds([]);
    setMaxFeed(-1);
    if (selectedUser.id === "everyone") {
      fetchFeeds(0);
    } else {
      fetchCertainFeeds(0, selectedUser.id);
    }
  };

  const handleGetAllFeeds = () => {
    setEditing(false);
    setPage(0);
    setFeeds([]);
    setMaxFeed(-1);
    fetchFeeds(0);
  };

  const handleGetCertainFeeds = (userId) => {
    setEditing(false);
    setPage(0);
    setFeeds([]);
    setMaxFeed(-1);
    fetchCertainFeeds(0, userId);
  };

  const handleReactFeed = async (feedId, icon) => {
    // Validate icon type
    console.log(icon);
    const validIcons = ["like", "haha", "sad", "angry", "wow", "love"];
    if (!validIcons.includes(icon)) {
      console.error("Invalid reaction icon");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://skn7vgp9-10000.asse.devtunnels.ms/api/feed/reaction/${feedId}`,
        {
          method: "POST",
          headers: {
            "x-api-key": "abc-xyz-www",
            authorization: signInKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            icon: icon,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Update the feeds state with the new reaction data
        setFeeds((prevFeeds) =>
          prevFeeds.map((feed) => {
            if (feed._id === feedId) {
              return data.metadata;
            }
            return feed;
          })
        );
      } else {
        if (data.message === "User ID does not match token") {
          signout();
        } else if (data.message === "Existing resource") {
          // Handle case where reaction already exists
          console.error("Reaction already exists");
        } else if (data.message === "Not found resource") {
          console.error("Feed not found");
        } else {
          console.error("Failed to react to feed:", data.message);
        }
      }
    } catch (error) {
      console.error("Error reacting to feed:", error);
      setShowReloadPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const [reportState, setReportState] = useState({
    isOpen: false,
    target: null,
    step: "type",
    type: null,
    reason: null,
  });

  const handleReportClick = (feed) => {
    setReportState({
      isOpen: true,
      target: feed,
      step: "type",
      type: null,
      reason: null,
    });
  };

  const closeReport = () => {
    setReportState({
      isOpen: false,
      target: null,
      step: "type",
      type: null,
      reason: null,
    });
  };

  const handleReportSubmit = async () => {
    try {
      setIsSubmitting(true);
      setLoading(true);

      const apiEndpoint =
        reportState.type === "user"
          ? `https://skn7vgp9-10000.asse.devtunnels.ms/api/report/user/${reportState.target.userId._id}`
          : `https://skn7vgp9-10000.asse.devtunnels.ms/api/report/feed/${reportState.target._id}`;

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "x-api-key": "abc-xyz-www",
          authorization: signInKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: reportState.reason,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        closeReport();
      } else {
        if (data.message === "User ID does not match token") {
          signout();
        } else {
        }
      }
    } catch (error) {
      console.error("Error submitting report:", error);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const saveEdit = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://skn7vgp9-10000.asse.devtunnels.ms/api/feed/${currentFeed._id}`,
        {
          method: "PATCH",
          headers: {
            "x-api-key": "abc-xyz-www",
            authorization: signInKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description: editDescription,
            visibility:
              editSendTo.length === 0
                ? user.friendList.map((friend) => friend._id)
                : editSendTo, // Send as array directly
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setFeeds((prevFeeds) =>
          prevFeeds.map((feed) => {
            if (feed._id === currentFeed._id) {
              return data.metadata;
            }
            return feed;
          })
        );
        setEditing(false);
      } else {
        if (data.message === "User ID does not match token") {
          signout();
        } else {
          // Show error message to user
          console.error("Failed to update feed:", data.message);
        }
      }
    } catch (error) {
      console.error("Error updating feed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowPopup(true);
  };

  const cancelDeleteClick = () => {
    setShowPopup(false);
  };

  const handleDelete = async () => {
    try {
      setProcessing(true);
      setLoading(true);

      const response = await fetch(
        `https://skn7vgp9-10000.asse.devtunnels.ms/api/feed/${currentFeed._id}`,
        {
          method: "DELETE",
          headers: {
            "x-api-key": "abc-xyz-www",
            authorization: signInKey,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Remove the deleted feed from state
        setFeeds((prevFeeds) =>
          prevFeeds.filter((feed) => feed._id !== currentFeed._id)
        );
        setMaxFeed((prev) => prev - 1);
        setShowPopup(false);
      } else {
        if (data.message === "User ID does not match token") {
          signout();
        } else {
          // Show error message to user
          console.error("Failed to delete feed:", data.message);
        }
      }
    } catch (error) {
      console.error("Error deleting feed:", error);
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (firstLoad === true) {
      setFirstLoad(false);
      return;
    }

    if (selectedUser.id === "everyone") {
      handleGetAllFeeds();
    } else {
      console.log("2");
      handleGetCertainFeeds(selectedUser.id);
    }
  }, [selectedUser]);

  return (
    <div className="relative flex flex-col justify-start items-center bg-transparent w-full h-[calc(100vh-64px)] overflow-hidden">
      <div
        ref={contentRef}
        className="relative flex flex-col justify-start items-center bg-transparent w-full h-full overflow-hidden snap-y"
      >
        <FriendSelection
          user={user}
          handleReloadFeeds={handleReloadFeeds}
          handleGetCertainFeeds={handleGetCertainFeeds}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
        />
        <div className="snap-start w-full h-full flex-shrink-0">
          <CreateFeed
            user={user}
            signInKey={signInKey}
            handleReloadFeeds={handleReloadFeeds}
            turnOffCamera={turnOffCamera}
          />
        </div>
        {feeds.length > 0 && (
          <>
            {feeds.map((feed) => (
              <div
                key={feed?._id}
                className="snap-start w-full h-full flex-shrink-0"
              >
                <Feed
                  feed={feed}
                  user={user}
                  editing={editing}
                  setEditDescription={setEditDescription}
                  setEditSendTo={setEditSendTo}
                />
              </div>
            ))}
          </>
        )}
      </div>
      <div className="absolute flex flex-col space-y-5 right-4 top-1/2 transform -translate-y-1/2 items-center">
        {feeds.length > 0 && (
          <div className=" space-y-5">
            <Button
              isActive={!loading && page !== 0}
              text={<p className="text-primary bold text-2xl px-1">↑</p>}
              handleClick={
                !loading && page !== 0 ? () => handleScroll(-1) : () => {}
              }
            />
            <Button
              isActive={!loading && (page !== maxFeed || maxFeed === -1)}
              text={<p className="text-primary bold text-2xl px-1">↓</p>}
              handleClick={
                !loading && (page !== maxFeed || maxFeed === -1)
                  ? () => handleScroll(1)
                  : () => {}
              }
            />
          </div>
        )}

        {!loading && (
          <Button
            isActive={!loading}
            text={<p className="text-primary bold text-2xl px-1">↻</p>}
            handleClick={!loading ? handleReloadFeeds : () => {}}
          />
        )}
      </div>
      {page !== 0 && feeds.length !== 0 && (
        <div
          ref={reactBarRef}
          className="fixed bottom-0 w-full flex justify-center"
        >
          <ReactBar
            handleTakePhotoBtn={handleTakePhotoBtn}
            isEditable={
              currentFeed?.userId?._id.toString() === user?._id?.toString()
                ? true
                : false
            }
            feed={currentFeed}
            handleReactFeed={handleReactFeed}
            user={user}
            setEditing={setEditing}
            editing={editing}
            saveEdit={saveEdit}
            handleDeleteClick={handleDeleteClick}
            isCommenting={isCommenting}
            setIsCommenting={setIsCommenting}
            comment={comment}
            setComment={setComment}
            sendMessage={sendMessage}
            sendingComment={sendingComment}
            handleReportClick={handleReportClick}
          />
        </div>
      )}
      {showPopup && (
        <div className="z-20">
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-primary bg-opacity-75">
            <div className="bg-primary rounded-3xl w-[400px] h-[200px] bg-opacity-1 shadow-2xl shadow-blueColor ">
              <p className="mt-8 mb-4 text-gray bold text-lg">
                Do you want to delete this feed?
              </p>
              <div className="mt-14 flex justify-center items-center space-x-4">
                <Button
                  text={processing ? "Processing..." : "Yes, I do"}
                  isActive={true}
                  handleClick={handleDelete}
                />
                <Button
                  text={"No, I don't"}
                  isActive={true}
                  handleClick={cancelDeleteClick}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {showReloadPopup && (
        <div className="z-20">
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-primary bg-opacity-75">
            <div className="bg-primary rounded-3xl w-[400px] h-[200px] bg-opacity-1 shadow-2xl shadow-blueColor ">
              <p className="mt-8 mb-4 text-gray bold text-lg">
                This feed is currently unavailable, Please reload to update
                feeds!
              </p>
              <div className="mt-14 mb-2 flex justify-center items-center space-x-4">
                <Button
                  text={"Reload"}
                  isActive={true}
                  handleClick={() => {
                    setShowReloadPopup(false);
                    handleReloadFeeds();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {reportState.isOpen && (
        <div className="z-20">
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-primary bg-opacity-75">
            <div className="bg-primary rounded-3xl w-[400px] p-6 bg-opacity-1 shadow-2xl shadow-blueColor">
              <h2 className="text-lg font-bold mb-4">
                {reportState.step === "type" &&
                  "What would you like to report?"}
                {reportState.step === "reason" &&
                  `Select a reason for reporting the ${reportState.type}`}
                {reportState.step === "confirm" && "Confirm Report"}
              </h2>

              {/* Step 1: Report Type Selection */}
              {reportState.step === "type" && (
                <div className="space-y-4">
                  <div className="flex justify-center space-x-4">
                    <Button
                      text="Report User"
                      isActive={true}
                      handleClick={() =>
                        setReportState((prev) => ({
                          ...prev,
                          type: "user",
                          step: "reason",
                        }))
                      }
                    />
                    <Button
                      text="Report Feed"
                      isActive={true}
                      handleClick={() =>
                        setReportState((prev) => ({
                          ...prev,
                          type: "feed",
                          step: "reason",
                        }))
                      }
                    />
                  </div>
                  <div className="flex justify-center mt-4">
                    <Button
                      text="Cancel"
                      isActive={true}
                      handleClick={closeReport}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Reason Selection */}
              {reportState.step === "reason" && (
                <div className="space-y-4">
                  {reportState.type === "user" ? (
                    <div className="flex justify-center space-x-4">
                      <Button
                        text="Inappropriate Feeds"
                        isActive={true}
                        handleClick={() =>
                          setReportState((prev) => ({
                            ...prev,
                            reason: 0,
                            step: "confirm",
                          }))
                        }
                      />
                      <Button
                        text="Offending Others"
                        isActive={true}
                        handleClick={() =>
                          setReportState((prev) => ({
                            ...prev,
                            reason: 1,
                            step: "confirm",
                          }))
                        }
                      />
                    </div>
                  ) : (
                    <div className="flex justify-center space-x-4">
                      <Button
                        text="Sensitive Image"
                        isActive={true}
                        handleClick={() =>
                          setReportState((prev) => ({
                            ...prev,
                            reason: 0,
                            step: "confirm",
                          }))
                        }
                      />
                      <Button
                        text="Inappropriate Words"
                        isActive={true}
                        handleClick={() =>
                          setReportState((prev) => ({
                            ...prev,
                            reason: 1,
                            step: "confirm",
                          }))
                        }
                      />
                    </div>
                  )}
                  <div className="flex justify-center mt-4">
                    <Button
                      text="Back"
                      isActive={true}
                      handleClick={() =>
                        setReportState((prev) => ({
                          ...prev,
                          step: "type",
                          type: null,
                        }))
                      }
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Confirmation */}
              {reportState.step === "confirm" && (
                <div className="space-y-4">
                  <p className="mb-4">
                    Are you sure you want to report this {reportState.type} for:
                    <br />
                    <span className="font-bold">
                      {reportState.type === "user"
                        ? reportState.reason === 0
                          ? "Inappropriate Feeds"
                          : "Offending Others"
                        : reportState.reason === 0
                        ? "Sensitive Image"
                        : "Inappropriate Words"}
                    </span>
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button
                      text={isSubmitting ? "Processing..." : "Submit Report"}
                      isActive={!isSubmitting}
                      handleClick={handleReportSubmit}
                    />
                    <Button
                      text="Cancel"
                      isActive={true}
                      handleClick={closeReport}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Main;
