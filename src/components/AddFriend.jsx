import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Cookies from "js-cookie";
import { useFriendSocket } from "../hooks/useFriendSocket";
const LandingPage = ({ user, setUser, signInKey }) => {
  const [searchParams] = useSearchParams();
  const _id = searchParams.get("_id");
  const fullname = searchParams.get("fullname");
  const profileImageUrl = searchParams.get("profileImageUrl");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  console.log({ user, signInKey });
  useFriendSocket({ user, setUser });

  const handleAddFriend = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://skn7vgp9-10000.asse.devtunnels.ms/api/user/invite/add",
        {
          method: "PATCH",
          headers: {
            "x-api-key": "abc-xyz-www",
            "Content-Type": "application/json",
            authorization: signInKey,
          },
          body: JSON.stringify({
            userId: _id,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Friend invite sent successfully!");
      } else {
        switch (response.status) {
          case 400:
            setMessage("You are already friends with this user.");
            break;
          case 404:
            setMessage("User not found.");
            break;
          case 409:
            setMessage("You have already sent a friend request to this user.");
            break;
          default:
            setMessage("An error occurred. Please try again.");
        }
      }
    } catch (error) {
      setMessage("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        {/* Profile Image */}
        <div className="mb-6">
          <div className="w-24 h-24 rounded-full border-4 border-cyan-500 overflow-hidden mx-auto">
            <img
              src={profileImageUrl || "/api/placeholder/96/96"}
              alt={fullname}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-2">
          Add {fullname} on Skyline
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 mb-8">
          Pics from your best friends on your Home Screen
        </p>

        {/* Message */}
        {message && (
          <p
            className={`mb-4 ${
              message.includes("success") ? "text-green-400" : "text-red-400"
            }`}
          >
            {message}
          </p>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleAddFriend}
            disabled={isLoading}
            className={`bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg transition-colors ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Sending..." : "Add Friend"}
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Open Skyline
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
