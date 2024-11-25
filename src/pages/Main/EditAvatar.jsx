import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import TakePhotoButton from "../../components/TakePhotoButton";
import { Camera } from "react-camera-pro";
import Button from "../../components/Button";
import "react-image-crop/dist/ReactCrop.css";
import ReactCrop from "react-image-crop";
import { useProfileSocket } from "../../hooks/useProfileSocket";

const ImageFromCamera = ({ user, setUser, signInKey, setPage }) => {
  const contentRef = useRef(null);
  const cameraRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [error, setError] = useState("");
  const [process, setProcess] = useState(false);
  useProfileSocket({ user, setUser });
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

  const handleRetakePhoto = () => {
    setPreviewUrl(null);
    setPhotoTaken(false);
  };

  const handleSavePhoto = async () => {
    setError("");
    setProcess(true);
    try {
      // Convert the data URL to a Blob object
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.src = previewUrl;
      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        // flip
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0);
        // Convert the canvas to a blob
        canvas.toBlob(async (blob) => {
          const formData = new FormData();
          formData.append("image", blob, "avatar.jpg");
          const apiResponse = await fetch(
            "https://skn7vgp9-10000.asse.devtunnels.ms/account/profile-image",
            {
              method: "PATCH",
              headers: {
                "api-key": "ABC-XYZ-WWW",
                authorization: signInKey,
                "user-id": user?._id,
              },
              body: formData,
            }
          );

          const data = await apiResponse.json();
          if (apiResponse.ok) {
            setUser(data.metadata);
            setError("");
          } else {
            setError(data.message || "Failed to save photo");
          }

          setProcess(false);
          setPreviewUrl(null);
          setPhotoTaken(false);
        }, "image/jpeg");
      };
    } catch (err) {
      console.error("Error saving photo:", err);
      setError("An error occurred while saving the photo");
      setProcess(false);
    }
  };

  return (
    <div className="justify-center flex items-center bg-transparent h-[calc(100vh_-_64px)] max-h-[calc(100vh_-_64px)]">
      <div
        ref={contentRef}
        className="bg-primary w-[500px] h-[700px] p-8 rounded-3xl shadow-2xl border-t-4 border-blueColor flex flex-col items-center"
      >
        <p className="text-2xl text-blueColor font-bold">
          Let's choose your new avatar!
        </p>
        <div className="relative mt-8 w-[400px] h-[400px] z-0">
          <div className="absolute z-0 inset-0 rounded-[80px] border-4 border-blueColor overflow-hidden">
            {previewUrl ? (
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
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {photoTaken ? (
          <div className="mt-16 flex space-x-5 items-center">
            <Button
              isActive={!process}
              text={
                process ? (
                  "Processing..."
                ) : (
                  <img
                    style={{ padding: "0px 20px", width: "73px" }}
                    src="assets/images/send.png"
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
                  src="assets/images/retake.png"
                />
              }
              handleClick={handleRetakePhoto}
            />
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
                  src="assets/images/album.png"
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

const ImageFromDevice = ({ user, setUser, signInKey, setPage }) => {
  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCrop] = useState({ aspect: 1 }); // Crop mặc định với tỷ lệ 1:1
  const [completedCrop, setCompletedCrop] = useState(null);
  const [process, setProcess] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const fileInputRef = useRef(null);
  const imgRef = useRef(null);
  const contentRef = useRef(null);

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

  useEffect(() => {
    console.log(windowWidth);
  }, [windowWidth]);

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

  // Hàm lưu ảnh đã cắt
  const handleSavePhoto = async () => {
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
      canvas.toBlob(resolve, "image/png")
    );
    // Tải ảnh đã cắt lên server
    const formData = new FormData();
    formData.append("file", blob, "avatar.png");
    const apiResponse = await fetch(
      "https://skn7vgp9-10000.asse.devtunnels.ms/api/user/profile-image",
      {
        method: "PATCH",
        headers: {
          "x-api-key": "abc-xyz-www",
          authorization: signInKey,
        },
        body: formData,
      }
    );

    const data = await apiResponse.json();
    if (apiResponse.ok) {
      setUser(data.metadata);
      setImgSrc("");
      setCompletedCrop(null);
      setCrop({ aspect: 1 });
      setProcess(false);
      // setTimeout(() => {
      //   window.location.reload();
      // }, 3000);
    } else {
      console.error(data.message || "Failed to save photo");
    }
  };

  return (
    <div className="flex items-center justify-center bg-transparent z-10 h-[calc(100vh_-_64px)] max-h-[calc(100vh_-_64px)]">
      <div
        ref={contentRef}
        className="bg-primary lg:w-[900px] md:w-[700px] lg:h-[650px] md:h-[600px] p-5 rounded-3xl shadow-2xl border-t-4 border-blueColor flex flex-col items-center"
      >
        <p className="text-2xl text-blueColor font-bold">
          Let's choose your new avatar!
        </p>
        <div className="mt-8 lg:w-[750px] md:w-[600px] lg:h-[500px] md:h-[400px] bg-zinc-800 rounded-[80px] border-4 border-blueColor overflow-hidden">
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
                src="assets/images/album.png"
              />
            }
          />
          <Button
            isActive={true}
            handleClick={() => setPage("camera")}
            text={
              <img
                style={{ padding: "0px 20px", width: "73px" }}
                src="assets/images/camera.png"
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
                    src="assets/images/send.png"
                  />
                )
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default function EditAvatar({ user, setUser, signInKey }) {
  const [page, setPage] = useState("camera");
  return (
    <div>
      {page === "device" ? (
        <ImageFromDevice
          user={user}
          setUser={setUser}
          signInKey={signInKey}
          setPage={setPage}
        />
      ) : (
        <ImageFromCamera
          user={user}
          setUser={setUser}
          signInKey={signInKey}
          setPage={setPage}
        />
      )}
    </div>
  );
}
