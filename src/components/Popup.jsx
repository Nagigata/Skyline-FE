import React from "react";
import Button from "./Button";

const Popup = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-primary bg-opacity-75">
      <div className="bg-primary rounded-3xl w-[400px] h-[200px] bg-opacity-1 shadow-2xl shadow-blueColor ">
        <p className="mt-8 mb-4 text-gray bold text-lg">{message}</p>
        <div className="mt-14 flex justify-center items-center space-x-4">
          <Button text={"Yes, I do"} isActive={true} handleClick={onConfirm} />
          <Button text={"No, I don't"} isActive={true} handleClick={onCancel} />
        </div>
      </div>
    </div>
  );
};

export default Popup;
