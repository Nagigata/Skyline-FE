import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import TakePhotoButton from "../../components/TakePhotoButton";
import { Camera } from "react-camera-pro";
import Button from "../../components/Button";
import "react-image-crop/dist/ReactCrop.css";
import ReactCrop from "react-image-crop";
import FriendLogo from "../../components/FriendLogo";

const ImageFromCamera = ({
  user,
  signInKey,
  setPage,
  handleReloadFeeds,
  turnOffCamera,
}) => {
  const contentRef = useRef(null);
  const cameraRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [error, setError] = useState("");
  const [process, setProcess] = useState(false);
  const [description, setDescription] = useState("");
  const [sendTo, setSendTo] = useState([]);

  useEffect(() => {
    if (turnOffCamera === true) {
      handleRetakePhoto();
    }
  }, [turnOffCamera]);

  useEffect(() => {
    const content = contentRef.current;
    gsap.fromTo(content, { opacity: 0 }, { opacity: 1, duration: 1 });
  }, []);

  const handleTakePhoto = () => {
    const photo = cameraRef.current.takePhoto();
    fetch(photo)
      .then((res) => res.blob())
      .then((blob) => {
        setPreviewUrl(URL.createObjectURL(blob));
        setPhotoTaken(true);
      })
      .catch((err) => console.error("Error processing photo:", err));
  };

  const descriptionChangeHandler = (event) => {
    if (event.target.value.length > 40) return;
    setDescription(event.target.value);
  };

  const handleRetakePhoto = () => {
    setPreviewUrl(null);
    setPhotoTaken(false);
    setDescription("");
    setSendTo([]);
  };

  const handleSavePhoto = async () => {
    setError("");
    setProcess(true);
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.src = previewUrl;
      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          async (blob) => {
            const formData = new FormData();
            formData.append("image", blob, "avatar.png");
            formData.append("description", description);

            if (sendTo.length === 0) {
              user.friendList.forEach((friend) => {
                formData.append("visibility[]", friend._id);
              });
            } else {
              sendTo.forEach((id) => {
                formData.append("visibility[]", id);
              });
            }

            const apiResponse = await fetch(
              "https://skn7vgp9-10000.asse.devtunnels.ms/api/feed",
              {
                method: "POST",
                headers: {
                  "x-api-key": "abc-xyz-www",
                  authorization: signInKey,
                  "user-id": user?._id,
                },
                body: formData,
              }
            );

            const data = await apiResponse.json();
            if (apiResponse.ok) {
              console.log(data);
              setSendTo([]);
              setDescription("");
              setError("");
              await handleReloadFeeds();
            } else {
              setError(data.message || "Failed to save photo");
            }

            setProcess(false);
            setPreviewUrl(null);
            setPhotoTaken(false);
          },
          "image/jpeg",
          1
        );
      };
    } catch (err) {
      console.error("Error saving photo:", err);
      setError("An error occurred while saving the photo");
      setProcess(false);
    }
  };

  const handleInputChange = (event) => {
    const input = event.target;
    input.style.width = `${
      input.value.length > 13 ? 130 + 6 * (input.value.length - 13) : 130
    }px`;
  };

  const handleFriendLogoClick = (friendId) => {
    if (friendId === "all") {
      setSendTo([]);
      return;
    }
    if (sendTo.length === 0 || !sendTo.some((i) => i === friendId)) {
      setSendTo((old) => [...old, friendId]);
    } else {
      setSendTo((old) => old.filter((i) => i !== friendId));
    }
  };

  return (
    <div className="justify-center flex items-center bg-transparent h-[calc(100vh_-_64px)] max-h-[calc(100vh_-_64px)]">
      <div
        ref={contentRef}
        className="bg-primary w-[500px] h-[700px] p-8 rounded-3xl shadow-2xl border-t-2 border-blueColor flex flex-col items-center"
      >
        <p className="text-base text-blueColor font-bold">
          {photoTaken ? "Send to..." : "Let's create your new feed!"}
        </p>
        <div className="relative mt-8 w-[400px] h-[400px] z-0">
          <div className="absolute z-0 inset-0 rounded-[80px] border-[1px] border-blueColor overflow-hidden">
            {turnOffCamera ? (
              <img
                src={"/public/assets/images/noneCamera.png"}
                alt="Avatar Preview"
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
            ) : previewUrl ? (
              <img
                src={previewUrl}
                alt="Avatar Preview"
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
            ) : (
              <Camera
                ref={cameraRef}
                aspectRatio={1}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          {photoTaken && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
              <input
                className="outline-none rounded-3xl text-xs bg-zinc-800 bg-opacity-70 text-gray placeholder:text-gray semibold text-center py-3"
                placeholder="Add a message"
                autoComplete="off"
                onInput={handleInputChange}
                onChange={descriptionChangeHandler}
                value={description}
              />
            </div>
          )}
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {photoTaken ? (
          <div>
            <div className="mt-16 flex justify-center space-x-5 items-center">
              <Button
                isActive={!process}
                text={
                  process ? (
                    "Processing..."
                  ) : (
                    <img
                      style={{ padding: "0px 20px", width: "73px" }}
                      src="/public/assets/images/send.png"
                    />
                  )
                }
                handleClick={!process ? handleSavePhoto : () => {}}
              />
              <Button
                isActive={true}
                text={
                  <img
                    style={{ padding: "0px 20px", width: "70px" }}
                    src="/public/assets/images/retake.png"
                  />
                }
                handleClick={handleRetakePhoto}
              />
            </div>
            <div className="mt-4 flex space-x-3 w-[400px] overflow-x-auto justify-center items-center pb-2">
              <div className="" onClick={() => handleFriendLogoClick("all")}>
                <FriendLogo
                  key={-1}
                  user={{
                    fullname: "All",
                    profileImageUrl: "/public/assets/images/friend.png",
                  }}
                  isActive={sendTo.length === 0 ? true : false}
                />
              </div>
              {user.friendList.map((friend, index) => (
                <div
                  key={friend._id}
                  onClick={() => handleFriendLogoClick(friend._id)}
                >
                  <FriendLogo
                    key={index}
                    user={friend}
                    isActive={sendTo.some((i) => i === friend._id)}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-2 flex flex-col justify-center items-center">
            <Button
              isActive={true}
              handleClick={() => {
                setPage("device");
              }}
              text={
                <img
                  style={{ padding: "0px 20px", width: "70px" }}
                  src="/public/assets/images/album.png"
                />
              }
            />
            <div className="mt-12"></div>
            <TakePhotoButton handleClick={handleTakePhoto} />
          </div>
        )}
      </div>
    </div>
  );
};

const ImageFromDevice = ({
  user,
  signInKey,
  setPage,
  handleReloadFeeds,
  turnOffCamera,
}) => {
  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCrop] = useState({ aspect: 1 }); // Crop mặc định với tỷ lệ 1:1
  const [completedCrop, setCompletedCrop] = useState(null);
  const [process, setProcess] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [description, setDescription] = useState("");
  const [sendTo, setSendTo] = useState([]);

  const fileInputRef = useRef(null);
  const imgRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    reinitState();
  }, [turnOffCamera]);

  useEffect(() => {
    const content = contentRef.current;
    gsap.fromTo(content, { opacity: 0 }, { opacity: 1, duration: 1 });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Hàm đọc file và thiết lập imgSrc
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgSrc(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const descriptionChangeHandler = (event) => {
    if (event.target.value.length > 40) return;
    setDescription(event.target.value);
  };

  const handleInputChange = (event) => {
    const input = event.target;
    input.style.width = `${
      input.value.length > 13 ? 130 + 6 * (input.value.length - 13) : 130
    }px`;
  };

  const handleFriendLogoClick = (friendId) => {
    if (friendId === "all") {
      setSendTo([]);
      return;
    }
    if (sendTo.length === 0 || !sendTo.some((i) => i === friendId)) {
      setSendTo((old) => [...old, friendId]);
    } else {
      setSendTo((old) => old.filter((i) => i !== friendId));
    }
  };

  const reinitState = () => {
    setImgSrc("");
    setCompletedCrop(null);
    setCrop({ aspect: 1 });
    setProcess(false);
    setDescription("");
    setSendTo([]);
  };

  // Hàm lưu ảnh đã cắt
  const handleSavePhoto = async () => {
    try {
      setProcess(true);
      if (!imgRef.current || !completedCrop) {
        throw new Error("Crop data does not exist");
      }
      const image = imgRef.current;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;

      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png", 1)
      );

      const formData = new FormData();
      formData.append("image", blob, "avatar.png");
      formData.append("description", description);

      if (sendTo.length === 0) {
        user.friendList.forEach((friend) => {
          formData.append("visibility[]", friend._id);
        });
      } else {
        sendTo.forEach((id) => {
          formData.append("visibility[]", id);
        });
      }

      const apiResponse = await fetch(
        "https://skn7vgp9-10000.asse.devtunnels.ms/api/feed",
        {
          method: "POST",
          headers: {
            "x-api-key": "abc-xyz-www",
            authorization: signInKey,
            "user-id": user?._id,
          },
          body: formData,
        }
      );

      const data = await apiResponse.json();

      if (apiResponse.ok) {
        reinitState();
        await handleReloadFeeds();
      } else {
        throw new Error(data.message || "Failed to save photo");
      }
    } catch (error) {
      console.error("Error saving photo:", error);
      setProcess(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-transparent z-10 h-[calc(100vh_-_64px)] max-h-[calc(100vh_-_64px)]">
      <div
        ref={contentRef}
        className=" bg-primary lg:w-[900px] md:w-[750px] lg:h-[700px] md:h-[650px] p-3 rounded-3xl shadow-2xl border-t-4 border-blueColor flex flex-col items-center"
      >
        <p className="text-2xl text-blueColor bold">
          {completedCrop ? "Send to..." : "Let's create your new feed!"}
        </p>
        <div className="relative mt-8 lg:w-[750px] md:w-[600px] lg:h-[500px] md:h-[400px] bg-zinc-800 rounded-[80px] border-[3px] border-blueColor overflow-hidden">
          {imgSrc && (
            <ReactCrop
              crop={crop}
              onChange={(newCrop) => setCrop(newCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1} // Tỷ lệ 1:1
            >
              <img
                ref={imgRef}
                src={imgSrc}
                alt="Crop me"
                className="z-0"
                style={{
                  width: "auto",
                  height: windowWidth < 1024 ? "400px" : "500px",
                }}
              />
            </ReactCrop>
          )}
          {!imgSrc && (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No image selected</p>
            </div>
          )}
          {completedCrop && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
              <input
                className="outline-none rounded-3xl text-xs bg-zinc-800 bg-opacity-70 text-gray placeholder:text-gray semibold text-center py-3"
                placeholder="Add a message"
                autoComplete="off"
                onInput={handleInputChange}
                onChange={descriptionChangeHandler}
                value={description}
              />
            </div>
          )}
        </div>
        <div className="mt-3 flex items-center space-x-5">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            isActive={true}
            handleClick={() => fileInputRef.current.click()}
            text={
              <img
                style={{ padding: "0px 20px", width: "73px" }}
                src="/public/assets/images/album.png"
              />
            }
          />
          <Button
            isActive={true}
            handleClick={() => setPage("camera")}
            text={
              <img
                style={{ padding: "0px 20px", width: "73px" }}
                src="/public/assets/images/camera.png"
              />
            }
          />
          {completedCrop && (
            <Button
              isActive={!process}
              handleClick={handleSavePhoto}
              text={
                process ? (
                  "Processing..."
                ) : (
                  <img
                    style={{ padding: "0px 20px", width: "73px" }}
                    src="/public/assets/images/send.png"
                  />
                )
              }
            />
          )}
        </div>
        {completedCrop && (
          <div className="mt-4 flex space-x-3 w-[400px] overflow-x-auto justify-center items-center">
            <div className="" onClick={() => handleFriendLogoClick("all")}>
              <FriendLogo
                key={-1}
                user={{
                  fullname: "All",
                  profileImageUrl: "/public/assets/images/friend.png",
                }}
                isActive={sendTo.length === 0 ? true : false}
              />
            </div>
            {user.friendList.map((friend, index) => (
              <div
                key={friend._id}
                onClick={() => handleFriendLogoClick(friend._id)}
              >
                <FriendLogo
                  key={index}
                  user={friend}
                  isActive={sendTo.some((i) => i === friend._id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function CreateFeed({
  user,
  signInKey,
  handleReloadFeeds,
  turnOffCamera,
}) {
  const [page, setPage] = useState("camera");
  return (
    <div>
      {page === "device" ? (
        <ImageFromDevice
          user={user}
          signInKey={signInKey}
          setPage={setPage}
          handleReloadFeeds={handleReloadFeeds}
          turnOffCamera={turnOffCamera}
        />
      ) : (
        <ImageFromCamera
          user={user}
          signInKey={signInKey}
          setPage={setPage}
          handleReloadFeeds={handleReloadFeeds}
          turnOffCamera={turnOffCamera}
        />
      )}
    </div>
  );
}
