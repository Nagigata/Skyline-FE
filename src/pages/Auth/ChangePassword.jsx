import { useState, useRef, useEffect } from "react";
import Logo from "../../components/Logo";
import Input from "../../components/Input";
import PasswordInput from "../../components/PasswordInput";
import Button from "../../components/Button";
import gsap from "gsap";

const validatePassword = (password) => {
  const regex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(?=.{8,})/;
  return regex.test(password);
};

const ChangePassword = ({
  verifiedEmail,
  handleBackClick,
}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState("");
  const [isSuccessfully, setIsSuccessfully] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const contentRef = useRef(null);

  useEffect(() => {
    const content = contentRef.current;
    gsap.fromTo(content, { opacity: 0 }, { opacity: 1, duration: 1, delay: 1 });
  }, []);

  const checkValid = () => {
    if (
      validatePassword(password) && 
      password === confirmPassword && 
      code.trim().length > 0
    ) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  };

  useEffect(() => {
    checkValid();
  }, [password, confirmPassword, code]);

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
  };

  const handleCodeChange = (event) => {
    setCode(event.target.value);
  };

  const handleClick = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(
        "https://skn7vgp9-10000.asse.devtunnels.ms/api/password",
        {
          method: "PATCH",
          headers: {
            "x-api-key": "abc-xyz-www",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: verifiedEmail,
            password: password,
            code: parseInt(code, 10),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          if (Array.isArray(data.message)) {
            setError(data.message[0]); // "password is not strong enough"
          } else if (data.message === "Incorrect Resource") {
            setError("Invalid verification code.");
          } else if (data.message === "Expired Resource") {
            setError("Verification code has expired. Please request a new one.");
          } else {
            setError(data.message || "Invalid request.");
          }
        } else if (response.status === 404) {
          setError("Email not found.");
        } else {
          setError("An unknown error occurred.");
        }
      } else {
        setIsSuccessfully(true);
        setTimeout(() => {
          handleBackClick();
        }, 2000);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to change password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-primary flex flex-col w-full pt-10 border-t-4 border-y-blueColor rounded-lg">
      <Logo />
      <div
        ref={contentRef}
        className="pt-28 flex flex-col items-center justify-center"
      >
        <p className="bold text-2xl pb-7 text-gray">
          Let's change your password!
        </p>
        <div className="mt-4">
          <p className="text-left text-gray text-sm ml-2 pb-1">Password</p>
          <PasswordInput
            text={"Password"}
            handleChange={handlePasswordChange}
            name={"password"}
            value={password}
          />
        </div>
        <div className="mt-4">
          <p className="text-left text-gray text-sm ml-2 pb-1">
            Confirm password
          </p>
          <PasswordInput
            text={"Confirm password"}
            handleChange={handleConfirmPasswordChange}
            name={"confirmPassword"}
            value={confirmPassword}
          />
        </div>
        <div className="mt-2">
          <p className="text-left text-gray text-sm ml-2 pb-1">Code</p>
          <Input
            text={"Verification Code"}
            handleChange={handleCodeChange}
            name={"code"}
            value={code}
          />
          <p className="text-left text-zinc-500 text-xs ml-2 pt-2">
            Code has been sent to {verifiedEmail}
          </p>
        </div>
        <p className="pt-3 text-xs text-zinc-600 pb-10">
          Your password must have at least 8 characters, including <br />
          <span className="text-zinc-400">special characters</span>,{" "}
          <span className="text-zinc-400">capital letters</span>, and{" "}
          <span className="text-zinc-400">number</span>
        </p>
        <div className="flex justify-center space-x-4">
          <Button
            text={isLoading ? "Changing..." : "Change password"}
            handleClick={!isLoading && isValid ? handleClick : () => {}}
            isActive={!isLoading && isValid}
          />
          <Button text={"Back"} handleClick={handleBackClick} isActive={true} />
        </div>
        {error && <p className="text-red-500 pt-4">{error}</p>}
        {isSuccessfully && (
          <p className="text-green-500 text-base pt-4">
            Password changed successfully!
          </p>
        )}
      </div>
    </div>
  );
};

export default ChangePassword;