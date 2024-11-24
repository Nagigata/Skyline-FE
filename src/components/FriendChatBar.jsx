import React, { useState, useEffect, useCallback } from "react";
import moment from "moment";

const FriendChatBar = ({
  id,
  imageUrl,
  fullname,
  message,
  sendTime,
  isNew,
  selectedFriendId,
}) => {
  const formatTime = useCallback((time) => {
    const now = moment();
    const feedTime = moment(time);
    const diffInMinutes = now.diff(feedTime, "minutes");
    const diffInHours = now.diff(feedTime, "hours");
    const diffInDays = now.diff(feedTime, "days");

    if (diffInMinutes === 0) return "Now";
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d`;
    } else {
      return feedTime.format("DD MMM");
    }
  }, []);

  const [currentTime, setCurrentTime] = useState(() => formatTime(sendTime));

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(formatTime(sendTime));
    };

    // Cập nhật ngay lập tức khi sendTime thay đổi
    updateTime();

    // Cập nhật mỗi phút
    const timer = setInterval(updateTime, 60000);

    return () => clearInterval(timer);
  }, [sendTime, formatTime]);

  const formatMessage = (message) => {
    if (message.length < 25) return message;
    return message.substring(0, 22) + "...";
  };

  return (
    <div
      key={id}
      className={`flex justify-start items-center w-[200px] h-[50px space-x-3 my-2 p-2 rounded-3xl ${
        selectedFriendId === id && "bg-zinc-700"
      }`}
    >
      <div
        className={`rounded-full border-2 ${
          isNew ? "border-blueColor" : "border-zinc-500"
        }`}
      >
        <img
          src={imageUrl}
          className="w-8 h-8 rounded-full m-1"
          alt={fullname}
        />
      </div>
      <div className="flex flex-col space-y-[4px]">
        <div className="flex justify-start items-center space-x-4">
          <p className={`text-[12px] ${isNew ? "bold" : "semibold"}`}>
            {fullname}
          </p>
          {sendTime && <p className="regular text-[10px]">{currentTime}</p>}
        </div>
        {message && (
          <p
            className={`text-[10px] ${isNew ? "semibold" : "medium"} text-left`}
          >
            {formatMessage(message)}
          </p>
        )}
      </div>
    </div>
  );
};

export default FriendChatBar;
