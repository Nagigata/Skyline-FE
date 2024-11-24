import React, { useRef, useEffect } from "react";
import gsap from "gsap";

const TakePhotoButton = ({ handleClick }) => {
  const buttonRef = useRef(null);

  useEffect(() => {
    const button = buttonRef.current;

    const handleMouseEnter = () => {
      gsap.to(button, { scale: 0.8, duration: 0.2 });
    };
    const handleMouseLeave = () => {
      gsap.to(button, { scale: 1, duration: 0.2 });
    };

    button.addEventListener("mouseenter", handleMouseEnter);
    button.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      button.removeEventListener("mouseenter", handleMouseEnter);
      button.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const buttonClickHandler = () => {
    const button = buttonRef.current;
    gsap.to(button, { scale: 1, duration: 0.1 });
    handleClick();
  };

  return (
    <div className="border-4 w-20 h-20 border-blueColor rounded-full">
      <div
        ref={buttonRef}
        className="m-1 bg-white rounded-full w-16 h-16 cursor-pointer"
        onClick={buttonClickHandler}
      ></div>
    </div>
  );
};

export default TakePhotoButton;
