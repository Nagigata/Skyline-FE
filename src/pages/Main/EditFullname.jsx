import React, { useEffect, useRef, useState } from "react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import gsap from "gsap";
import { useProfileSocket } from "../../hooks/useProfileSocket";

const EditFullname = ({ user, signInKey, setUser }) => {
  const [fullname, setFullname] = useState(user.fullname);
  const [valid, setValid] = useState(false);
  const [processing, setProcessing] = useState(false);

  const contentRef = useRef(null);
  useProfileSocket({ user, setUser });
  useEffect(() => {
    const content = contentRef.current;
    gsap.fromTo(content, { opacity: 0 }, { opacity: 1, duration: 1 });
  }, []);

  useEffect(() => {
    const oldFullname = user.fullname;
    if (fullname.length !== 0 && fullname !== oldFullname) {
      setValid(true);
    } else {
      setValid(false);
    }
  }, [fullname, user]);

  const handleFullnameChange = (event) => {
    setFullname(event.target.value);
  };

  const handleClick = async () => {
    setProcessing(true);
    try {
      const response = await fetch(
        "https://skn7vgp9-10000.asse.devtunnels.ms/api/user/fullname",
        {
          method: "PATCH",
          headers: {
            "x-api-key": "abc-xyz-www",
            "Content-Type": "application/json",
            authorization: signInKey,
          },
          body: JSON.stringify({
            fullname: fullname,
          }),
        }
      );
      const data = await response.json();
      setUser(data.metadata);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center bg-transparent"
      style={{ height: "calc(100vh - 64px)" }}
    >
      <div
        ref={contentRef}
        className="bg-primary w-[500px] h-[400px] p-8 rounded-3xl shadow-2xl border-t-4 border-blueColor flex flex-col justify-center items-center"
      >
        <p className="text-3xl text-blueColor bold pb-20">
          What is your new name?
        </p>
        <div>
          <Input
            text={"Full Name"}
            handleChange={handleFullnameChange}
            value={fullname}
            name={"fullname"}
          />
          <div className="pb-4"></div>
          <Button
            isActive={!processing && valid}
            text={processing ? "Processing..." : "Save your name"}
            handleClick={!processing && valid ? handleClick : () => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default EditFullname;
