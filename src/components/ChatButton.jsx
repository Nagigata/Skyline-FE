import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
const ChatButton = ({ numberOfNewMessage, clickHandler, isLoadingChat }) => {
  const buttonRef = useRef(null);
  useEffect(() => {
    const button = buttonRef.current;

    const handleMouseEnter = () => {
      gsap.to(button, { scale: 0.9, duration: 0.2 });
    };
    const handleMouseLeave = () => {
      gsap.to(button, { scale: 1, duration: 0.2 });
    };

    button.addEventListener("mouseenter", handleMouseEnter);
    button.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      button.removeEventListener("mouseenter", handleMouseEnter);
      button.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);
  return (
    <div
      ref={buttonRef}
      className={`relative rounded-3xl p-3 ${
        isLoadingChat ? "bg-zinc-800" : "bg-blueColor cursor-pointer"
      }`}
      onClick={isLoadingChat ? () => {} : clickHandler}
    >
      {numberOfNewMessage > 0 && (
        <div className="absolute -right-1 -top-1 rounded-full w-6 h-6 bg-red-500 p-1 flex items-center justify-center">
          <p className="text-white text-[10px]">{numberOfNewMessage}</p>
        </div>
      )}
      <img className="w-7" src={"/public/assets/images/chat.png"} />
    </div>
  );
};

export default ChatButton;
