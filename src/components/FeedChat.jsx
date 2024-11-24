import React from "react";
import moment from "moment";

const FeedChat = ({ feed, friend, user, createdAt, senderId}) => {
  const formatTime = (time) => {
    const now = moment();
    const feedTime = moment(time);
    const diffInMinutes = now.diff(feedTime, "minutes");
    const diffInHours = now.diff(feedTime, "hours");
    const diffInDays = now.diff(feedTime, "days");
    const diffInMonths = now.diff(feedTime, "months");
    const diffInYears = now.diff(feedTime, "years");

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInDays < 30) {
      return `${diffInDays} days ago`;
    } else if (diffInMonths < 12) {
      return `${diffInMonths} months ago`;
    } else {
      return `${diffInYears} years ago`;
    }
  };

  return (
    <div className="relative">
      <img
        src={feed.imageUrl}
        alt={feed.description}
        className="mt-2 rounded-[25px]"
      />
      <div className="absolute px-2 py-1 rounded-3xl bg-[#8F9089] bg-opacity-60 flex space-x-1 top-2 left-3 items-center">
        <img
          className="w-5 h-5 rounded-full"
          src={
            senderId === user._id
              ? user.profileImageUrl
              : friend.friendImageUrl
          }
        />
        <p className="text-xs">
          {senderId=== user._id ? "You" : friend.friendFullname}
        </p>
      </div>
      <div className="absolute rounded-3xl bg-[#8F9089] bg-opacity-60 top-2 right-3 py-1 px-2">
        <p className="text-xs">{formatTime(feed.createdAt)}</p>
      </div>
      <div className="absolute rounded-3xl bg-[#8F9089] bg-opacity-60 top-2 right-3 py-1 px-2">
        <p className="text-xs text-white">
          {formatTime(createdAt || "2024-10-02T17:22:03.967Z")}
        </p>
      </div>
      {feed.description && (
        <div className="absolute rounded-3xl bg-[#8F9089] bg-opacity-60 py-2 px-2 bottom-3 right-1/2 translate-x-1/2">
          <p className="text-xs text-white">{feed.description}</p>
        </div>
      )}
    </div>
  );
};

export default FeedChat;
