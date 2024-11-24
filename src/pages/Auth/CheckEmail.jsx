import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import Button from "../../components/Button";
import Logo from "../../components/Logo";
import Input from "../../components/Input";

function isValidEmail(email) {
  const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return re.test(String(email).toLowerCase());
}

function Email({
  setAuth,
  setVerifiedEmail,
  handleBackClick,
  setEmail,
  email,
}) {
  const [isCorrectFormatEmail, setIsCorrectFormatEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const contentRef = useRef(null);

  useEffect(() => {
    const content = contentRef.current;
    gsap.fromTo(content, { opacity: 0 }, { opacity: 1, duration: 1, delay: 1 });
  }, []);

  const handleClick = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(
        "https://skn7vgp9-10000.asse.devtunnels.ms/api/user/check",
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
        if (data.message === "API key is required") {
          setError("API key is required.");
        } else if (data.message === "API key is incorrect") {
          setError("API key is incorrect.");
        } else if (data.message === "Email is registered") {
          setError("Email is already registered.");
        } else if (data.message === "Email is invalid") {
          setError("Email format is invalid.");
        } else {
          setError("An unknown error occurred.");
        }
      } else {
        setVerifiedEmail(email);
        setAuth(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to send code. Please try again.");
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
          <Button
            text={isLoading ? "Sending..." : "Send code to your email"}
            handleClick={
              !isLoading && isCorrectFormatEmail ? handleClick : () => {}
            }
            isActive={!isLoading && isCorrectFormatEmail}
          />
          <Button text={"Back"} handleClick={handleBackClick} isActive={true} />
        </div>
        {error && <p className="text-red-500 pt-4">{error}</p>}
      </div>
    </div>
  );
}

export default function CheckEmail({
  handleBackClick,
  setAuth,
  setVerifiedEmail,
}) {
  const [email, setEmail] = useState("");
  return (
    <Email
      setEmail={setEmail}
      email={email}
      handleBackClick={handleBackClick}
      setAuth={setAuth}
      setVerifiedEmail={setVerifiedEmail}
    />
  );
}
