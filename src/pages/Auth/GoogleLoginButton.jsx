import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";

const GoogleLoginButton = ({
  onLoginSuccess,
  setErrorMessage,
  setIsLoading,
}) => {
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      setErrorMessage("");
      setIsLoading(true);

      try {
        const res = await fetch(
          "https://skn7vgp9-10000.asse.devtunnels.ms/api/sign-in/google",
          {
            method: "POST",
            headers: {
              "x-api-key": "abc-xyz-www",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: response.access_token }),
          }
        );

        const data = await res.json();

        if (res.ok) {
          // Call the onLoginSuccess callback with user data
          onLoginSuccess(data.metadata);
          console.log(data.metadata)
        } else {
          if (res.status === 403) {
            setErrorMessage("Your account has been banned.");
          } else {
            setErrorMessage(
              data.message || "Google sign in failed. Please try again."
            );
          }
        }
      } catch (error) {
        console.error("Google login error:", error);
        setErrorMessage("Network error. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google login error:", error);
      setErrorMessage("Google sign in failed. Please try again.");
    },
  });

  return (
    <div className="flex flex-col space-y-4">
      <div className="relative flex py-3 items-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="flex-shrink mx-4 text-gray-600">Or</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-4 
        border-gray-300 rounded-2xl shadow-sm flex items-center justify-center transition duration-200 text-black"
        type="button"
        onClick={handleGoogleLogin}
      >
        <img
          src="assets/images/google.png"
          alt="Google logo"
          className="w-5 h-5 mr-2"
        />
        Sign in with Google
      </motion.button>
    </div>
  );
};

export default GoogleLoginButton;
