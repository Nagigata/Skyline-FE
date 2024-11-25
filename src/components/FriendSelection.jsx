import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";

const FriendSelection = ({ user, selectedUser, setSelectedUser }) => {
  const imgRef = useRef(null);
  const rotationAngle = useRef(0);
  const [clicked, setClicked] = useState(false);
  const dropdownRef = useRef(null); // Ref cho dropdown

  const handleClick = () => {
    rotationAngle.current += 180;
    gsap.to(imgRef.current, {
      rotation: rotationAngle.current,
      duration: 0.3,
    });
    setClicked(!clicked);
  };

  // Hàm xử lý click ngoài dropdown
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      if (clicked) {
        handleClick();
      }
    }
  };

  // Thêm và loại bỏ sự kiện click toàn cục
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [clicked]);

  return (
    <div
      className="fixed flex flex-col justify-center items-center z-50"
      ref={dropdownRef}
    >
      <div
        className="bg-[#292929] w-[200px] rounded-3xl flex justify-center items-center mt-2 py-3 px-4 cursor-pointer"
        onClick={handleClick}
      >
        <p className="text-gray text-sm font-bold">{selectedUser.fullname}</p>
        <img
          ref={imgRef}
          className="w-3 ml-2 mt-[2px]"
          src={"assets/images/arrow.png"}
          alt="Arrow"
        />
      </div>
      {clicked && (
        <div className="mt-2 bg-[#292929] p-2 rounded-3xl w-[400px]">
          <ul className="list-none">
            {selectedUser.id !== "everyone" && (
              <li
                key={"everyone"}
                onClick={() => {
                  setSelectedUser({
                    id: "everyone",
                    fullname: "Everyone",
                  });
                  handleClick();
                }}
                className="flex items-center justify-between mb-1 p-1 hover:bg-zinc-700 hover:rounded-3xl cursor-pointer"
              >
                <div className="flex items-center ml-2">
                  <img
                    className="w-8 h-8 rounded-full mr-4"
                    src={"assets/images/friend.png"}
                    alt="Everyone"
                  />
                  <p className="text-gray medium text-[13px] truncate w-[calc(100% - 100px)]">
                    Everyone
                  </p>
                </div>
                <img
                  src="assets/images/right-arrow.png"
                  className="w-2 mt-[2px] mr-3"
                />
              </li>
            )}
            {selectedUser.id !== user._id && (
              <li
                key={user._id.toString()}
                className="flex items-center justify-between mb-1 p-1 hover:bg-zinc-700 hover:rounded-3xl cursor-pointer"
                onClick={() => {
                  setSelectedUser({
                    id: user._id,
                    fullname: `You`,
                  });
                  handleClick();
                }}
              >
                <div className="flex items-center ml-2">
                  <img
                    className="w-8 h-8 rounded-full mr-4"
                    src={user.profileImageUrl}
                    alt={user.fullname} 
                  />
                  <p className="text-gray medium text-[13px] truncate w-[calc(100% - 100px)]">
                    You
                  </p>
                </div>
                <img
                  src="assets/images/right-arrow.png"
                  className="w-2 mt-[2px] mr-3"
                />
              </li>
            )}
            {user.friendList.map((friend) => {
              if (friend._id.toString() !== selectedUser.id) {
                return (
                  <li
                    key={friend._id.toString()}
                    className="flex items-center justify-between mb-1 p-1 hover:bg-zinc-700 hover:rounded-3xl cursor-pointer"
                    onClick={() => {
                      setSelectedUser({
                        id: friend._id,
                        fullname: friend.fullname,
                      });
                      handleClick();
                    }}
                  >
                    <div className="flex items-center ml-2">
                      <img
                        className="w-8 h-8 rounded-full mr-4"
                        src={friend.profileImageUrl}
                        alt={friend.fullname}
                      />
                      <p className="text-gray medium text-[13px] truncate w-[calc(100% - 100px)]">
                        {friend.fullname}
                      </p>
                    </div>
                    <img
                      src="assets/images/right-arrow.png"
                      className="w-2 mt-[2px] mr-3"
                    />
                  </li>
                );
              }
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FriendSelection;
