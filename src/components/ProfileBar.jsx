import React, { useState } from "react";
import ShareIcon from "@mui/icons-material/Share";
import CheckIcon from "@mui/icons-material/Check";

const ProfileBar = ({ user }) => {
  const [copied, setCopied] = useState(false);
  console.log(user);
  const handleShareClick = async () => {
    const shareLink = `https://selection-page.onrender.com/friend/${user._id}`;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="flex flex-row items-center justify-between bg-primary sm:w-[420px] md:w-[700px] lg:w-[930px] h-[60px] pr-3 rounded-[60px] shadow-lg shadow-blueColor">
      <div className="flex items-center">
        <div className="ml-2 border border-blueColor rounded-full p-0.5">
          <img
            src={user.profileImageUrl}
            className="rounded-full w-10 h-10"
            alt="profile"
          />
        </div>
        <p className="font-bold text-sm text-gray ml-3">{user.fullname}</p>
      </div>
      <div className="flex items-center space-x-8">
        <button
          onClick={handleShareClick}
          className="flex items-center justify-center px-3 py-1 bg-blueColor text-white rounded-full text-xs font-semibold transition duration-300 hover:bg-opacity-80"
        >
          <span className="mr-2">{copied ? "Link Copied!" : "Share Link"}</span>
          {copied ? (
            <CheckIcon sx={{ fontSize: 16, color: "#ffffff  " }} />
          ) : (
            <ShareIcon sx={{ fontSize: 16, color: "#ffffff" }} />
          )}
        </button>
        <div className="flex flex-col justify-center p-2 bg-blueColor rounded-[30px] text-zinc-900 text-xs font-medium">
          <div className="flex items-center">
            <img
              className="w-4 mr-2"
              src="/public/assets/images/email.png"
              alt="email"
            />
            <p>{user.email}</p>
          </div>
          <div className="flex items-start">
            <img
              className="w-4 mr-2"
              src="/public/assets/images/birthday.png"
              alt="birthday"
            />
            <p>{user.birthday}</p>
            <div className="flex items-center ml-6">
              <img
                className="w-4 mr-2"
                src="/public/assets/images/country.png"
                alt="birthday"
              />
              <p>{user.country}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileBar;
