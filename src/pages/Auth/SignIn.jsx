import { useState, useRef, useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Logo from "../../components/Logo";
import PasswordInput from "../../components/PasswordInput";
import Input from "../../components/Input";
import Button from "../../components/Button";
import ChangePassword from "./ChangePassword";
import CheckEmailChangePassword from "./CheckEmailChangePassword";
import GoogleLoginButton from "./GoogleLoginButton";
import gsap from "gsap";
import SmallButton from "../../components/SmallButton";
import Cookies from "js-cookie";

const isValidEmail = (email) => {
  const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return re.test(String(email).toLowerCase());
};

const validatePassword = (password) => {
  const regex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(?=.{8,})/;
  return regex.test(password);
};

const SignInPage = ({
  handleBackClick,
  setPage,
  setSignInKey,
  setUser,
  setJustSignIn,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const contentRef = useRef(null);

  useEffect(() => {
    const content = contentRef.current;
    gsap.fromTo(
      content,
      { opacity: 0 },
      { opacity: 1, duration: 1, delay: 1.5 }
    );

    const savedEmail = Cookies.get("rememberMeEmail");
    const savedPassword = Cookies.get("rememberMePassword");

    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const checkValid = () => {
    if (isValidEmail(email) && validatePassword(password)) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  };

  useEffect(() => {
    checkValid();
  }, [email, password]);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleRememberMeChange = (event) => {
    setRememberMe(event.target.checked);
  };

  const handleGoogleLoginSuccess = (loginData) => {
    console.log(loginData)
    console.log(loginData.user)
    setSignInKey(loginData.signInToken)
    setUser(loginData.user);
    setJustSignIn(false);
    setSignInKey(loginData.signInToken);
  };

  const handleClick = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(
        "https://skn7vgp9-10000.asse.devtunnels.ms/api/user/sign-in",
        {
          method: "POST",
          headers: {
            "x-api-key": "abc-xyz-www",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        if (data.message === "API key is required") {
          setError("API key is required.");
        } else if (data.message === "API key is incorrect") {
          setError("API key is incorrect.");
        } else if (data.message === "Data is required") {
          setError('Data is required".');
        } else if (data.message === "Email is not registered") {
          setError("Email is not registered.");
        } else if (data.message === "Password is incorrect") {
          setError("Password is incorrect.");
        } else {
          setError("An unknown error occurred.");
        }
      } else {
        if (rememberMe) {
          Cookies.set("rememberMeEmail", email, {
            secure: true,
            sameSite: "Strict",
          });
          Cookies.set("rememberMePassword", password, {
            secure: true,
            sameSite: "Strict",
          });
        } else {
          Cookies.remove("rememberMeEmail");
          Cookies.remove("rememberMePassword");
        }
        setUser(data.metadata.user);
        setJustSignIn(false);
        setSignInKey(data.metadata.signInToken);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-primary flex flex-col w-full pt-10 border-t-4 border-blueColor rounded-lg">
      <Logo />
      <div
        ref={contentRef}
        className="pt-14 flex flex-col items-center justify-center"
      >
        <p className="bold text-4xl pb-8 text-gray">Sign in</p>
        <div className="mt-4">
          <p className="text-left text-gray text-sm ml-2 pb-1">Email</p>
          <Input
            text={"Email"}
            handleChange={handleEmailChange}
            name={"email"}
            value={email}
          />
        </div>
        <div className="mt-4">
          <p className="text-left text-gray text-sm ml-2 pb-1">Password</p>
          <PasswordInput
            text={"Password"}
            handleChange={handlePasswordChange}
            name={"password"}
            value={password}
          />
        </div>
        <div className="mt-4 mr-4 flex items-center w-80 justify-end">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={handleRememberMeChange}
            className="mr-2"
          />
          <label htmlFor="rememberMe" className="text-gray text-xs medium">
            Remember me
          </label>
        </div>

        <div className="mt-4">
          <SmallButton
            text={"Forgot password?"}
            handleClick={() => {
              setPage("forgotPassword");
            }}
            isActive={false}
          />
        </div>
        <div className="flex justify-center space-x-4 mt-8">
          <Button
            text={isLoading ? "Sending..." : "Continue"}
            handleClick={!isLoading && isValid ? handleClick : () => {}}
            isActive={!isLoading && isValid}
          />
          <Button text={"Back"} handleClick={handleBackClick} isActive={true} />
        </div>
        {error.length !== 0 && <p className="text-red-500 pt-4">{error}</p>}
        <div className="w-80">
          <GoogleLoginButton
            onLoginSuccess={handleGoogleLoginSuccess}
            setErrorMessage={setError}
            setIsLoading={setIsLoading}
          />
        </div>
      </div>
    </div>
  );
};

const ForgotPasswordPage = ({ handleBackClick }) => {
  const [isAuth, setAuth] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  return (
    <div>
      {isAuth ? (
        <ChangePassword
          verifiedEmail={verifiedEmail}
          handleBackClick={handleBackClick}
        />
      ) : (
        <CheckEmailChangePassword
          setVerifiedEmail={setVerifiedEmail}
          setAuth={setAuth}
          handleBackClick={handleBackClick}
        />
      )}
    </div>
  );
};

export default function SignIn({
  handleBackClick,
  setSignInKey,
  setUser,
  setJustSignIn,
}) {
  const [page, setPage] = useState("signin");
  const handleBackSignInClick = () => {
    setPage("signin");
  };
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div>
        {page === "forgotPassword" ? (
          <ForgotPasswordPage handleBackClick={handleBackSignInClick} />
        ) : (
          <SignInPage
            handleBackClick={handleBackClick}
            setPage={setPage}
            setUser={setUser}
            setSignInKey={setSignInKey}
            setJustSignIn={setJustSignIn}
          />
        )}
      </div>
    </GoogleOAuthProvider>
  );
}
