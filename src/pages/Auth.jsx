import { useState } from "react";
import Intro from "./Auth/Intro";
import SignUp from "./Auth/SignUp";
import SignIn from "./Auth/SignIn";

export default function Auth({ setUser, setSignInKey, setJustSignIn }) {
  const [page, setPage] = useState("intro");

  const handleSignUpClick = () => {
    setPage("signup");
  };
  const handleSignInClick = () => {
    setPage("signin");
  };
  const handleBackClick = () => {
    setPage("intro");
  };
  return (
    <div>
      {page === "intro" && (
        <Intro
          handleSignUpClick={handleSignUpClick}
          handleSignInClick={handleSignInClick}
        />
      )}
      {page === "signup" && (
        <SignUp handleBackClick={handleBackClick} setPage={setPage} />
      )}
      {page === "signin" && (
        <SignIn
          handleBackClick={handleBackClick}
          setUser={setUser}
          setSignInKey={setSignInKey}
          setJustSignIn={setJustSignIn}
        />
      )}
    </div>
  );
}
