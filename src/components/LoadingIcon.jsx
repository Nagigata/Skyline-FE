import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const LoadingIcon = () => {
  const iconRef = useRef(null);
  const tweenRef = useRef(null);

  useEffect(() => {
    if (iconRef.current) {
      gsap.set(iconRef.current, { rotation: 0 });
      tweenRef.current = gsap.to(iconRef.current, {
        rotation: 360,
        duration: 1,
        repeat: -1,
        ease: "linear",
      });
    }

    return () => {
      if (tweenRef.current) {
        tweenRef.current.kill();
      }
    };
  }, []);

  return (
    <img
      ref={iconRef}
      className="w-7"
      src="assets/images/loadingCircle.png"
    />
  );
};

export default LoadingIcon;