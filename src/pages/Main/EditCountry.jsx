import React, { useEffect, useRef, useState } from "react";
import Button from "../../components/Button";
import gsap from "gsap";
import { useProfileSocket } from "../../hooks/useProfileSocket";
import { iso31661 } from "iso-3166";
const EditCountry = ({ user, signInKey, setUser }) => {
  const [country, setCountry] = useState(user.country || "");
  const [valid, setValid] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const contentRef = useRef(null);
  useProfileSocket({ user, setUser });

  const countryList = Object.entries(iso31661)
    .map(([alpha3, country]) => ({
      alpha3: country.alpha3,
      name: country.name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    const content = contentRef.current;
    gsap.fromTo(content, { opacity: 0 }, { opacity: 1, duration: 1 });
  }, []);

  useEffect(() => {
    const oldCountry = user.country;
    if (country && country !== oldCountry) {
      setValid(true);
    } else {
      setValid(false);
    }
  }, [country, user]);

  const handleCountryChange = (event) => {
    setCountry(event.target.value);
    setError("");
  };

  const handleClick = async () => {
    setProcessing(true);
    setError("");
    try {
      const response = await fetch(
        "https://skn7vgp9-10000.asse.devtunnels.ms/api/user/country",
        {
          method: "PATCH",
          headers: {
            "x-api-key": "abc-xyz-www",
            "Content-Type": "application/json",
            authorization: signInKey,
          },
          body: JSON.stringify({
            country: country,
          }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setError("Sign in key is missing, is wrong, or is expired");
        } else {
          setError(data.message || "An unknown error occurred.");
        }
      } else {
        setUser(data.metadata);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to update country. Please try again.");
    } finally {
      setProcessing(false);
      setValid(false);
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
        <p className="bold text-2xl pb-7 text-blueColor">
          What is your country?
        </p>
        <div className="mt-2 relative">
          <select
            value={country}
            onChange={handleCountryChange}
            className="bg-[#29282C] text-sm text-gray rounded-2xl p-3 w-80 focus:outline-none focus:ring-2 flex items-center justify-center"
          >
            <option value="">Select a country</option>
            {countryList.map(({ alpha3, name }) => (
              <option key={alpha3} value={alpha3}>
                {name} ({alpha3})
              </option>
            ))}
          </select>
        </div>
        <div className="pt-8 flex justify-center space-x-4">
          <Button
            text={processing ? "Processing..." : "Save your country"}
            handleClick={!processing && valid ? handleClick : () => {}}
            isActive={!processing && valid}
          />
        </div>
        {error && <p className="text-xs text-red-500 pt-4">{error}</p>}
      </div>
    </div>
  );
};

export default EditCountry;
