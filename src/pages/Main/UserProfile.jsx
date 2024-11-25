import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ProfileBar from "../../components/ProfileBar";
import DeleteButton from "../../components/DeleteButton";
import SmallProfileBar from "../../components/SmallProfileBar";
import AcceptButton from "../../components/AcceptButton";
import Popup from "../../components/Popup";
import { useFriendSocket } from "../../hooks/useFriendSocket";
import { useProfileSocket } from "../../hooks/useProfileSocket";

const UserProfile = ({ user, setUser, signInKey, setLoading }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState(null);

  const contentRef = useRef(null);
  const profileBarRef = useRef(null);
  const friendDivRef = useRef(null);
  const receivedInviteDivRef = useRef(null);
  const sentInviteDivRef = useRef(null);

  const numberOfFriends = user.friendList.length;

  // Lọc received invites và sent invites
  const receivedInvites = user.friendInvites.filter(
    (invite) => invite.sender._id !== user._id
  );
  const sentInvites = user.friendInvites.filter(
    (invite) => invite.sender._id === user._id
  );

  const numberOfReceivedInvites = receivedInvites.length;
  const numberOfSentInvites = sentInvites.length;

  useFriendSocket({ user, setUser });
  useProfileSocket({ user, setUser });

  const friendList = user.friendList.map((friend) => (
    <div key={friend._id.toString()} className="relative">
      <SmallProfileBar user={friend} />
      <div className="ml-5 absolute right-2 top-[7px]">
        <DeleteButton clickHandler={() => handleDeleteFriend(friend._id)} />
      </div>
    </div>
  ));

  const receivedInviteList = receivedInvites.map((invite) => (
    <div key={invite._id.toString()} className="relative">
      <SmallProfileBar user={invite.sender} />
      <div className="ml-5 absolute right-2 top-[7px] flex">
        <AcceptButton clickHandler={() => handleAcceptInvite(invite._id)} />
        <div className="ml-2"></div>
        <DeleteButton
          clickHandler={() => handleRemoveReceivedInvite(invite._id)}
        />
      </div>
    </div>
  ));

  const sentInviteList = sentInvites.map((invite) => (
    <div key={invite._id.toString()} className="relative">
      <SmallProfileBar user={invite.receiver} />
    </div>
  ));

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(contentRef.current, { opacity: 0 }, { opacity: 1, duration: 1 })
      .fromTo(
        profileBarRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 }
      )
      .fromTo(
        friendDivRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 }
      )
      .fromTo(
        receivedInviteDivRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 }
      )
      .fromTo(
        sentInviteDivRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 }
      );
  }, []);

  const handleDeleteFriend = (friendId) => {
    setSelectedFriendId(friendId);
    setShowPopup(true);
  };

  const handleAcceptInvite = async (inviteId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://skn7vgp9-10000.asse.devtunnels.ms/api/user/invite/accept/${inviteId}`,
        {
          method: "PATCH",
          headers: {
            "x-api-key": "abc-xyz-www",
            authorization: signInKey,
          },
        }
      );

      const data = await response.json();

      if (response.status === 200) {
        setUser(data.metadata);
        // Optional: Add success notification
        console.log("Friend invite accepted successfully");
      } else {
        // Handle different error cases based on API response
        switch (response.status) {
          case 400:
            if (data.message === "Invalid Request") {
              console.error("User is not receiver");
            } else if (data.message === "Processed Resource") {
              console.error("Friend invite was already processed");
            }
            break;
          case 404:
            console.error("Friend invite not found");
            break;
          default:
            console.error("Error:", data.message);
        }
      }
    } catch (error) {
      console.error("Network or other error:", error);
    }
    setLoading(false);
  };

  const handleRemoveReceivedInvite = async (inviteId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://skn7vgp9-10000.asse.devtunnels.ms/api/user/invite/remove/${inviteId}`,
        {
          method: "DELETE",
          headers: {
            "x-api-key": "abc-xyz-www",
            authorization: signInKey,
          },
        }
      );

      const data = await response.json();

      if (response.status === 200) {
        setUser(data.metadata);
        console.log("Friend invite removed successfully");
      } else {
        // Handle different error cases
        switch (response.status) {
          case 400:
            if (data.message === "Invalid Request") {
              console.error("User is not receiver");
            } else if (data.message === "Processed Resource") {
              console.error("Friend invite was already processed");
            }
            break;
          case 404:
            console.error("Friend invite not found");
            break;
          default:
            console.error("Error:", data.message);
        }
      }
    } catch (error) {
      console.error("Network or other error:", error);
    }
    setLoading(false);
  };

  const confirmDeleteFriend = async () => {
    setShowPopup(false);
    setLoading(true);

    try {
      const response = await fetch(
        `https://skn7vgp9-10000.asse.devtunnels.ms/api/user/friend/delete/${selectedFriendId}`,
        {
          method: "DELETE",
          headers: {
            "x-api-key": "abc-xyz-www",
            authorization: signInKey,
          },
        }
      );

      const data = await response.json();

      if (response.status === 200) {
        setUser(data.metadata);
        console.log("Friend deleted successfully");
      } else if (response.status === 400) {
        // Handle case where users are not friends
        console.error("Users are not friends");
      } else {
        console.error("Error:", data.message);
      }
    } catch (error) {
      console.error("Network or other error:", error);
    }
    setLoading(false);
  };

  const cancelDeleteFriend = () => {
    setShowPopup(false);
  };

  return (
    <div
      className="flex flex-col justify-start items-center bg-transparent"
      style={{ height: "calc(100vh - 64px)" }}
    >
      <div
        ref={contentRef}
        className="flex flex-col justify-start items-center"
      >
        <p className="text-xl bold text-blueColor my-4">
          Let's see your wonderful profile
        </p>
        <div className="mb-5"></div>
        <div
          ref={profileBarRef}
          className="flex flex-col items-center flex-start space-y-2 w-full h-full p-2"
        >
          <ProfileBar user={user} />
        </div>
        <div className="mt-4 flex space-x-7">
          <div
            ref={friendDivRef}
            className="lg:w-[450px] md:w-[335px] h-[600px] flex flex-col justify-start items-center rounded-3xl bg-primary"
          >
            <p className="text-blueColor text-base semibold mt-4">
              {numberOfFriends} Friends
            </p>
            <div className="flex flex-col items-center flex-start space-y-2 w-full h-full overflow-y-auto p-2">
              {friendList}
            </div>
          </div>
          <div className="flex flex-col space-y-6">
            <div
              ref={receivedInviteDivRef}
              className="lg:w-[450px] md:w-[335px] h-[288px] flex flex-col justify-start items-center rounded-3xl bg-primary"
            >
              <p className="text-blueColor text-base semibold mt-4">
                {numberOfReceivedInvites} Received invites
              </p>
              <div className="flex flex-col items-center flex-start space-y-2 w-full h-full overflow-y-auto p-2">
                {receivedInviteList}
              </div>
            </div>
            <div
              ref={sentInviteDivRef}
              className="lg:w-[450px] md:w-[335px] h-[288px] flex flex-col justify-start items-center rounded-3xl bg-primary"
            >
              <p className="text-blueColor text-base semibold mt-4">
                {numberOfSentInvites} Sent invites
              </p>
              <div className="flex flex-col items-center flex-start space-y-2 w-full h-full overflow-y-auto p-2">
                {sentInviteList}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showPopup && (
        <div className="z-20">
          <Popup
            message="Do you want to delete this friend?"
            onConfirm={confirmDeleteFriend}
            onCancel={cancelDeleteFriend}
          />
        </div>
      )}
    </div>
  );
};

export default UserProfile;
