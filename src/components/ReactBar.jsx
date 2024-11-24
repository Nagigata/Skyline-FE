import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import SmallTakePhotoButton from "./SmallTakePhotoButton";
import Button from "./Button";

const ReactBar = ({
  handleTakePhotoBtn,
  isEditable,
  feed,
  handleDeleteClick,
  handleReactFeed,
  user,
  setEditing,
  editing,
  saveEdit,
  isCommenting,
  setIsCommenting,
  comment,
  setComment,
  sendMessage,
  sendingComment,
  handleReportClick,
}) => {
  const likeRef = useRef(null);
  const loveRef = useRef(null);
  const hahaRef = useRef(null);
  const wowRef = useRef(null);
  const sadRef = useRef(null);
  const angryRef = useRef(null);
  const loadingRef = useRef(null);

  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (sendingComment && loadingRef.current) {
      const tween = gsap.to(loadingRef.current, {
        rotation: 360,
        duration: 1,
        repeat: -1,
        ease: "linear",
      });

      return () => {
        tween.kill(); // Stop the animation when the component unmounts or sendingComment becomes false
      };
    }
  }, [sendingComment]);

  const isIconReacted = (icon) => {
    const reaction = feed?.reactions?.find(
      (reaction) => reaction?.userId?._id?.toString() === user?._id?.toString()
    );
    if (!reaction) {
      return false;
    }
    if (reaction?.icon === icon) return true;
    else return false;
  };

  useEffect(() => {
    if (isCommenting) return;
    const images = [
      likeRef.current,
      loveRef.current,
      hahaRef.current,
      wowRef.current,
      sadRef.current,
      angryRef.current,
    ];

    if (!isEditable) {
      images.forEach((image) => {
        const handleMouseEnter = () => {
          gsap.to(image, { scale: 0.8, duration: 0.1, ease: "power1.inOut" });
        };
        const handleMouseLeave = () => {
          gsap.to(image, { scale: 1, duration: 0.1, ease: "power1.inOut" });
        };

        image.addEventListener("mouseenter", handleMouseEnter);
        image.addEventListener("mouseleave", handleMouseLeave);

        return () => {
          image.removeEventListener("mouseenter", handleMouseEnter);
          image.removeEventListener("mouseleave", handleMouseLeave);
        };
      });
    }
  }, [isEditable]);

  return (
    <div className="relative fixed bottom-3 w-[500px] flex flex-col justify-center items-center">
      {!isCommenting ? (
        <div className="flex space-x-3 items-center justify-center mb-3">
          <div
            className="flex items-center px-6 py-2 space-x-4 rounded-[32px] bg-zinc-800"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <div
              className={`${!isEditable && "cursor-pointer"} ${
                isIconReacted("like") && "bg-zinc-700 rounded-3xl p-3"
              }`}
              onClick={
                isEditable
                  ? () => {}
                  : () => {
                      handleReactFeed(feed._id, "like");
                    }
              }
            >
              <img
                ref={likeRef}
                className="w-8 -translate-y-[3px]"
                src="/public/assets/images/like.png"
              />
              <p className="text-gray text-sm bold">
                {feed?.reactionStatistic?.like}
              </p>
            </div>
            <div
              className={`${!isEditable && "cursor-pointer"} ${
                isIconReacted("love") && "bg-zinc-700 rounded-3xl p-3"
              }`}
              onClick={
                isEditable
                  ? () => {}
                  : () => {
                      handleReactFeed(feed._id, "love");
                    }
              }
            >
              <img
                ref={loveRef}
                className="w-8"
                src="/public/assets/images/love.png"
              />
              <p className="text-gray text-sm bold">
                {feed?.reactionStatistic?.love}
              </p>
            </div>
            <div
              className={`${!isEditable && "cursor-pointer"} ${
                isIconReacted("haha") && "bg-zinc-700 rounded-3xl p-3"
              }`}
              onClick={
                isEditable
                  ? () => {}
                  : () => {
                      handleReactFeed(feed._id, "haha");
                    }
              }
            >
              <img
                ref={hahaRef}
                className="w-8"
                src="/public/assets/images/haha.png"
              />
              <p className="text-gray text-sm bold">
                {feed?.reactionStatistic?.haha}
              </p>
            </div>
            <div
              className={`${!isEditable && "cursor-pointer"} ${
                isIconReacted("wow") && "bg-zinc-700 rounded-3xl p-3"
              }`}
              onClick={
                isEditable
                  ? () => {}
                  : () => {
                      handleReactFeed(feed._id, "wow");
                    }
              }
            >
              <img
                ref={wowRef}
                className="w-8"
                src="/public/assets/images/wow.png"
              />
              <p className="text-gray text-sm bold">
                {feed?.reactionStatistic?.wow}
              </p>
            </div>
            <div
              className={`${!isEditable && "cursor-pointer"} ${
                isIconReacted("sad") && "bg-zinc-700 rounded-3xl p-3"
              }`}
              onClick={
                isEditable
                  ? () => {}
                  : () => {
                      handleReactFeed(feed._id, "sad");
                    }
              }
            >
              <img
                ref={sadRef}
                className="w-8"
                src="/public/assets/images/sad.png"
              />
              <p className="text-gray text-sm bold">
                {feed?.reactionStatistic?.sad}
              </p>
            </div>
            <div
              className={`${!isEditable && "cursor-pointer"} ${
                isIconReacted("angry") && "bg-zinc-700 rounded-3xl p-3"
              }`}
              onClick={
                isEditable
                  ? () => {}
                  : () => {
                      handleReactFeed(feed._id, "angry");
                    }
              }
            >
              <img
                ref={angryRef}
                className="w-8"
                src="/public/assets/images/angry.png"
              />
              <p className="text-gray text-sm bold">
                {feed?.reactionStatistic?.angry}
              </p>
            </div>
          </div>
          {!isEditable && (
            <Button
              text={
                <img src="/public/assets/images/comment.png" className="h-6" />
              }
              handleClick={() => {
                setIsCommenting((oldV) => !oldV);
              }}
              isActive={true}
            />
          )}
          {!isEditable && (
            <Button
              isActive={true}
              text={
                <img
                  className="w-5 mx-[1px]"
                  src="/public/assets/images/report.png"
                />
              }
              handleClick={() => handleReportClick(feed)}
            />
          )}
        </div>
      ) : (
        <div className="flex justify-center items-center space-x-4 mb-3">
          <input
            type="text"
            className="bg-zinc-950 bg-opacity-90 text-sm medium text-gray placeholder-zinc-700 sm: w-[370px] px-3 py-4 rounded-2xl focus:outline-none"
            placeholder="Reply to this feed..."
            value={comment}
            onChange={(event) => {
              setComment(event.target.value);
            }}
          />
          <Button
            text={
              <img className="w-5" src="/public/assets/images/cancel.png" />
            }
            isActive={true}
            handleClick={() => {
              setIsCommenting(false);
              setComment("");
            }}
          />
          <Button
            text={
              sendingComment ? (
                <img
                  ref={loadingRef}
                  className="w-7"
                  src="/public/assets/images/loadingCircle.png"
                />
              ) : (
                <img className="w-7" src="/public/assets/images/send.png" />
              )
            }
            isActive={true}
            handleClick={
              comment.length === 0 || sendingComment
                ? () => {}
                : () => {
                    sendMessage(feed.userId._id, comment, feed._id);
                  }
            }
          />
        </div>
      )}

      {isEditable && feed.reactions.length !== 0 && hovered && (
        <div className="absolute bottom-36 bg-zinc-800 bg-opacity-90 rounded-3xl p-2 mb-3 w-[300px]">
          <p className="text-gray text-sm font-semibold">
            Reactions: {feed.reactions.length}
          </p>
          <div className="flex flex-col space-y-2 mt-2">
            {feed.reactions.map((reaction) => (
              <div
                key={reaction._id}
                className="flex items-center justify-between w-full px-3"
              >
                {/* User Info */}
                <div className="flex items-center space-x-3">
                  <img
                    src={reaction.userId.profileImageUrl}
                    alt={`${reaction.userId.fullname}'s profile`}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <p className="text-gray text-xs">
                    {reaction.userId.fullname}
                  </p>
                </div>

                {/* Reaction Icons */}
                <div className="flex gap-1">
                  {Array.isArray(reaction.icon) ? (
                    // Map through array of icons
                    reaction.icon.map((icon, iconIndex) => (
                      <img
                        key={`${reaction._id}-${iconIndex}`}
                        className="w-4 h-4"
                        src={`/public/assets/images/${icon}.png`}
                        alt={icon}
                        title={icon}
                      />
                    ))
                  ) : (
                    // Handle single icon
                    <img
                      className="w-4 h-4"
                      src={`/public/assets/images/${reaction.icon}.png`}
                      alt={reaction.icon}
                      title={reaction.icon}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-center justify-center space-x-10">
        {isEditable && (
          <Button
            isActive={true}
            text={
              <img
                className={`w-5 ${!editing && "ml-1"}`}
                src={
                  editing
                    ? "/public/assets/images/cancel.png"
                    : "/public/assets/images/edit.png"
                }
              />
            }
            handleClick={
              editing
                ? () => {
                    setEditing(false);
                  }
                : () => {
                    setEditing(true);
                  }
            }
          />
        )}
        <SmallTakePhotoButton handleClick={handleTakePhotoBtn} />

        {isEditable && (
          <Button
            isActive={true}
            text={
              <img
                className={`w-5 mx-[2px]`}
                src={
                  editing
                    ? "/public/assets/images/accept.png"
                    : "/public/assets/images/delete.png"
                }
              />
            }
            handleClick={editing ? saveEdit : handleDeleteClick}
          />
        )}
      </div>
    </div>
  );
};

export default ReactBar;
