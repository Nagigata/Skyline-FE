import React from "react";

const SmallProfileBar = ({ user }) => {
  return (
    <div className="bg-zinc-800 rounded-full lg:w-[350px] md:w-[290px] h-[42px] flex items-center space-x-3 p-2">
      <img
        className="w-8 h-8 rounded-full"
        src={user.profileImageUrl}
        alt="Profile"
      />
      <p className="medium text-xs text-gray">{user.fullname}</p>
    </div>
  );
};

export default SmallProfileBar;
