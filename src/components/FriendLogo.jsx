import React, { useRef, useEffect } from "react";
import gsap from "gsap";

const FriendLogo = ({ user, isActive }) => {
  return (
    <div className="friend-logo flex items-center justify-center flex-col cursor-pointer transition-transform duration-300 hover:scale-90 w-[40px] h-[70px]">
      <div
        className={`rounded-full border-[2px] ${
          isActive ? "border-blueColor" : "border-zinc-700"
        }`}
      >
        <img
          src={user.profileImageUrl}
          className="w-7 m-1 rounded-full"
          alt={user.fullname}
        />
      </div>
      <p
        className={`mt-1 text-xs semibold ${
          isActive ? "text-blueColor" : "text-gray"
        }`}
      >
        {user.fullname}
      </p>
    </div>
  );
};

export default FriendLogo;
