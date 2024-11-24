import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import Button from "../../components/Button";
import Logo from "../../components/Logo";
import Input from "../../components/Input";

function isValidEmail(email) {
  const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return re.test(String(email).toLowerCase());
}

function Email({ setCode, handleBackClick, setEmail, email }) {
  const [isCorrectFormatEmail, setIsCorrectFormatEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const contentRef = useRef(null);
  const buttonRef = useRef(null);
  const backRef = useRef(null);

  useEffect(() => {
    const content = contentRef.current;
    gsap.fromTo(content, { opacity: 0 }, { opacity: 1, duration: 1, delay: 1 });
  }, []);

  useEffect(() => {
    const button = buttonRef.current;
    const back = backRef.current;

    const handleMouseEnter = (object) => {
      gsap.to(object, { scale: 0.9, duration: 0.2 });
    };

    const handleMouseLeave = (object) => {
      gsap.to(object, { scale: 1, duration: 0.2 });
    };

    back.addEventListener("mouseenter", () => handleMouseEnter(back));
    back.addEventListener("mouseleave", () => handleMouseLeave(back));
    button.addEventListener("mouseenter", () => handleMouseEnter(button));
    button.addEventListener("mouseleave", () => handleMouseLeave(button));

    return () => {
      button.removeEventListener("mouseenter", () => handleMouseEnter(button));
      button.removeEventListener("mouseleave", () => handleMouseLeave(button));
      back.removeEventListener("mouseenter", () => handleMouseEnter(back));
      back.removeEventListener("mouseleave", () => handleMouseLeave(back));
    };
  }, []);

  const handleClick = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(
        "https://skn7vgp9-10000.asse.devtunnels.ms/api/password/check",
        {
          method: "POST",
          headers: {
            "x-api-key": "abc-xyz-www",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setError("Email not found.");
        } else {
          setError(data.message || "An unknown error occurred.");
        }
      } else {
        // Assume code will be provided in verification step
        setCode(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (event) => {
    const email = event.target.value;
    setEmail(email);
    setIsCorrectFormatEmail(isValidEmail(email));
  };

  return (
    <div className="bg-primary flex flex-col w-full pt-10 border-t-4 border-blueColor rounded-lg">
      <Logo />
      <div
        ref={contentRef}
        className="pt-40 flex flex-col items-center justify-center"
      >
        <p className="bold text-2xl pb-7 text-gray">What's your email?</p>
        <Input
          text={"Email address"}
          handleChange={handleChange}
          name={"email"}
          value={email}
        />
        <p className="pt-20 text-xs text-white pb-3">
          By clicking the button below, you are agreeing to our
          <br />
          <span className="text-blueColor">Terms of Service</span> and{" "}
          <span className="text-blueColor">Privacy Policy</span>
        </p>
        <div className="flex justify-center space-x-4">
          <div ref={buttonRef}>
            <Button
              text={isLoading ? "Sending..." : "Send verification code"}
              handleClick={
                !isLoading && isCorrectFormatEmail ? handleClick : () => {}
              }
              isActive={!isLoading && isCorrectFormatEmail}
            />
          </div>
          <div ref={backRef}>
            <Button
              text={"Back"}
              handleClick={handleBackClick}
              isActive={true}
            />
          </div>
        </div>
        {error && <p className="text-red-500 pt-4">{error}</p>}
      </div>
    </div>
  );
}

function Code({ code, setAuth, setCode, email, setVerifiedEmail }) {
  const [enteredCode, setEnteredCode] = useState("");
  const [error, setError] = useState("");

  const contentRef = useRef(null);

  useEffect(() => {
    const content = contentRef.current;
    gsap.fromTo(content, { opacity: 0 }, { opacity: 1, duration: 1, delay: 1 });
  }, []);

  const handleClick = async () => {
    setError("");
    setVerifiedEmail(email);
    if (setAuth) setAuth(true);
  };

  const handleChange = (event) => {
    const code = event.target.value;
    setEnteredCode(code);
  };

  const handleBackClick = () => {
    setCode(null);
  };

  return (
    <div className="bg-black flex flex-col w-full pt-10 border-t-4 border-yellow-500 rounded-lg">
      <Logo />
      <div
        ref={contentRef}
        className="pt-40 flex flex-col items-center justify-center"
      >
        <p className="bold text-2xl pb-7 text-gray">Enter verification code</p>
        <Input
          text={"Verification code"}
          handleChange={handleChange}
          name={"code"}
          value={enteredCode}
        />
        <p className="pt-20 text-xs text-zinc-600 pb-3">
          We sent a verification code to your email, please check your inbox!
        </p>
        <div className="flex justify-center space-x-4">
          <Button
            text={"Verify code"}
            handleClick={handleClick}
            isActive={enteredCode.length > 0}
          />
          <Button text={"Back"} handleClick={handleBackClick} isActive={true} />
        </div>
        {error && <p className="text-red-500 pt-4">{error}</p>}
      </div>
    </div>
  );
}

export default function CheckEmailChangePassword({
  handleBackClick,
  setAuth,
  setVerifiedEmail,
}) {
  const [code, setCode] = useState(null);
  const [email, setEmail] = useState("");
  return (
    <div>
      {code ? (
        <Code
          email={email}
          setVerifiedEmail={setVerifiedEmail}
          code={code}
          setCode={setCode}
          setAuth={setAuth}
        />
      ) : (
        <Email
          setEmail={setEmail}
          email={email}
          handleBackClick={handleBackClick}
          setCode={setCode}
        />
      )}
    </div>
  );
}
