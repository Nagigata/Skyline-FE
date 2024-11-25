import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const AcceptButton = ({ clickHandler }) => {
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
  return (
    <div
      ref={buttonRef}
      onClick={clickHandler}
      className="cursor-pointer w-7 h-7 flex justify-center items-center bg-blueColor rounded-full"
    >
      <img className="w-5 h-5" src="assets/images/accept.png" />
    </div>
  );
};

export default AcceptButton;
