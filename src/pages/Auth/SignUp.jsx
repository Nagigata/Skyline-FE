import { useState } from "react";
import Infor from "./Infor";
import CheckEmail from "./CheckEmail";

export default function SignUp({ handleBackClick, setPage }) {
  const [isAuth, setAuth] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  return (
    <div>
      {isAuth ? (
        <Infor verifiedEmail={verifiedEmail} setPage={setPage} />
      ) : (
        <CheckEmail
          setVerifiedEmail={setVerifiedEmail}
          setAuth={setAuth}
          handleBackClick={handleBackClick}
        />
      )}
    </div>
  );
}
