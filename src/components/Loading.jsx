import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import "../index.css";

const PopupLoading = () => {
  const loadingRef = useRef(null);

  useEffect(() => {
    const loading = loadingRef.current;
    gsap.to(loading, {
      rotation: 370,
      repeat: -1,
      ease: "linear",
      duration: 1,
    });
  }, []);

  return (
    <div className="absolute top-0 left-0 h-svh w-svw bg-[rgba(0,0,0,0.8)] flex justify-center items-center z-50">
      <img
        ref={loadingRef}
        className="w-20"
        src="assets/images/loading.png"
        alt="Loading"
      />
    </div>
  );
};

export default PopupLoading;
