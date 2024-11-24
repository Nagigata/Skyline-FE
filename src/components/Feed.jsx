import React, { useState, useEffect } from "react";
import moment from "moment";
import Button from "./Button";
import FriendLogo from "./FriendLogo";

const Feed = ({ feed, user, editing, setEditDescription, setEditSendTo }) => {
  const [description, setDescription] = useState(feed.description || "");
  const [sendTo, setSendTo] = useState(
    feed.visibility === "everyone" ? [] : feed.visibility || []
  );

  useEffect(() => {
    if (editing === false && feed) {
      setDescription(feed.description || "");
      setSendTo(feed.visibility === "everyone" ? [] : feed.visibility || []);
    }
  }, [editing, feed]);

  useEffect(() => {
    setEditDescription(description);
    setEditSendTo(sendTo);
  }, [description, sendTo]);

  useEffect(() => {
    setDescription(feed.description || "");
    setSendTo(feed.visibility === "everyone" ? [] : feed.visibility || []);
  }, [feed]);

  const formatTime = (time) => {
    const now = moment();
    const feedTime = moment(time);
    const diffInMinutes = now.diff(feedTime, "minutes");
    const diffInHours = now.diff(feedTime, "hours");
    const diffInDays = now.diff(feedTime, "days");

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d`;
    } else {
      return feedTime.format("DD MMM");
    }
  };

  const handleFriendLogoClick = (id) => {
    if (id === "all") {
      setSendTo([]);
    } else {
      if (sendTo.includes(id)) {
        setSendTo(sendTo.filter((i) => i !== id));
      } else {
        setSendTo([...sendTo, id]);
      }
    }
  };

  return (
    <div className="justify-center flex items-center bg-transparent h-[calc(100vh_-_64px)] max-h-[calc(100vh_-_64px)]">
      <div
        className={`flex-col mb-32 space-y-5 flex items-center justify-center rounded-[40px] bg-primary w-[500px] max-h-[600px] h-[600px] relative`}
      >
        <div className="relative">
          <img
            className="w-[450px] h-[450px] rounded-[70px]"
            src={feed.imageUrl}
          />
          {(feed.description.length > 0 || editing) && (
            <input
              className={`absolute bottom-3 left-1/2 transform -translate-x-1/2 outline-none rounded-3xl text-sm  semibold text-center py-3 ${
                editing
                  ? "bg-white text-primary"
                  : "bg-zinc-800 text-gray bg-opacity-70"
              }`}
              type="text"
              value={description}
              readOnly={!editing}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
            />
          )}
        </div>
        {editing ? (
          <div className="mt-4 flex space-x-3 w-[400px] overflow-x-auto justify-center items-center">
            <div onClick={() => handleFriendLogoClick("all")}>
              <FriendLogo
                key={-1}
                user={{
                  fullname: "All",
                  profileImageUrl: "/public/assets/images/friend.png",
                }}
                isActive={sendTo.length === 0}
              />
            </div>
            {user.friendList.map((friend, index) => (
              <div
                key={friend._id}
                onClick={() => handleFriendLogoClick(friend._id)}
              >
                <FriendLogo
                  key={index}
                  user={friend}
                  isActive={sendTo.some((i) => i === friend._id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className=" flex items-center justify-center mt-3 space-x-3">
            <div className="flex items-center justify-center">
              <img
                src={feed.userId.profileImageUrl}
                className="w-7 rounded-full mr-2"
              />
              <p className="text-sm text-gray bold">
                {feed.userId._id.toString() === user._id.toString()
                  ? "You"
                  : feed.userId.fullname}
              </p>
            </div>
            <p className="text-sm semibold text-[#827C77] ml-2">
              {formatTime(feed.createdAt)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
