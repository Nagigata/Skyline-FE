import React, { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import Button from "./Button";

const ChatBar = ({ message, setMessage, sendMessage, sending }) => {
  const [isValid, setIsValid] = useState(false);

  const inputRef = useRef(null);
  const loadingRef = useRef(null);

  useEffect(() => {
    setIsValid(message.length > 0);
  }, [message]);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  useEffect(() => {
    if (sending) {
      gsap.to(loadingRef.current, {
        rotation: 360,
        duration: 1,
        repeat: -1,
        ease: "linear",
      });
    } else {
      gsap.killTweensOf(loadingRef.current);
      gsap.set(loadingRef.current, { rotation: 0 });
    }
  }, [sending]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && isValid && !sending) {
      sendMessage();
    }
  };

  return (
    <div className="flex items-center justify-center space-x-3 w-full h-[80px] bg-zinc-800">
      <input
        type="text"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyPress={handleKeyPress} // Thêm sự kiện onKeyPress vào input
        placeholder="Type a message..."
        ref={inputRef}
        className="2xl:w-[1000px] xl:w-[800px] lg:w-[650px] md:w-[500px] sm:w-[350px] h-[45px] rounded-3xl bg-zinc-500 bg-opacity-40 focus:outline-none text-sm semibold text-gray placeholder-zinc-400 px-3 py-2"
      />

      <Button
        text={
          sending ? (
            <img
              ref={loadingRef}
              className="w-6"
              src={"assets/images/loadingCircle.png"}
              alt="loading"
            />
          ) : (
            <img
              ref={loadingRef}
              className="w-6"
              src={"assets/images/send.png"}
              alt="send"
            />
          )
        }
        isActive={true}
        handleClick={isValid && !sending ? sendMessage : () => {}}
      />
    </div>
  );
};

export default ChatBar;
