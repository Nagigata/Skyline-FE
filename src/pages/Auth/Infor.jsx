import { useState, useRef, useEffect } from "react";
import Logo from "../../components/Logo";
import PasswordInput from "../../components/PasswordInput";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { DatePicker } from "@nextui-org/react";
import gsap from "gsap";
import { iso31661 } from "iso-3166";
const validatePassword = (password) => {
  const regex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(?=.{8,})/;
  return regex.test(password);
};

const getDate = ({ day, month, year }) => {
  const paddedDay = day.toString().padStart(2, "0");
  const paddedMonth = month.toString().padStart(2, "0");
  return `${paddedDay}/${paddedMonth}/${year}`;
};

const Infor = ({ verifiedEmail, setPage }) => {
  const [fullname, setFullname] = useState("");
  const [country, setCountry] = useState("");
  const [password, setPassword] = useState("");
  const [birthday, setBirthday] = useState(null);
  const [code, setCode] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState("");
  const [isSuccessfully, setIsSuccessfully] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const contentRef = useRef(null);
  const countryList = Object.entries(iso31661)
    .map(([alpha3, country]) => ({
      alpha3: country.alpha3,
      name: country.name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  useEffect(() => {
    const content = contentRef.current;
    gsap.fromTo(content, { opacity: 0 }, { opacity: 1, duration: 1, delay: 1 });
  }, []);

  const checkValid = () => {
    if (
      fullname.length !== 0 &&
      country.length !== 0 &&
      birthday !== null &&
      code.trim().length > 0 &&
      validatePassword(password) &&
      password === confirmPassword
    ) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  };

  useEffect(() => {
    checkValid();
  }, [fullname, country, password, confirmPassword, birthday]);

  const handleFullnameChange = (event) => {
    setFullname(event.target.value);
  };

  const handleCountryChange = (event) => {
    setCountry(event.target.value);
  };

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
    console.log({
      code: parseInt(code),
      email: verifiedEmail,
      fullname: fullname,
      password: password,
      country: country,
      birthday: getDate(birthday),
    });
    try {
      const response = await fetch(
        "https://skn7vgp9-10000.asse.devtunnels.ms/api/user/sign-up",
        {
          method: "POST",
          headers: {
            "x-api-key": "abc-xyz-www",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: parseInt(code),
            email: verifiedEmail,
            fullname: fullname,
            password: password,
            country: country,
            birthday: getDate(birthday),
          }),
        }
      );

      const data = await response.json();
      console.log(response.status);
      if (response.status === 201) {
        console.log("oke");
        setIsSuccessfully(true);
        setTimeout(() => {
          setPage("signin");
        }, 2000);
      } else if (response.status === 400) {
        console.log(data.message);
        if (data.message === "Incorrect Resource") {
          setError("The provided information is incorrect.");
        } else if (data.message === "Expired Resource") {
          setError("Your verification code has expired. Please try again.");
        }
        setIsSuccessfully(false);
      } else {
        setError("An unknown error occurred.");
        setIsSuccessfully(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to sign up. Please try again.");
      setIsSuccessfully(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-primary flex flex-col w-full pt-10 border-t-4 border-blueColor rounded-lg">
      <Logo />
      <div
        ref={contentRef}
        className="pt-16 flex flex-col items-center justify-center"
      >
        <p className="bold text-2xl pb-7 text-gray">
          We need your information!
        </p>
        <div className="mt-2">
          <p className="text-left text-gray text-sm ml-2 pb-1">Full Name</p>
          <Input
            text={"Full Name"}
            handleChange={handleFullnameChange}
            name={"fullname"}
            value={fullname}
          />
        </div>
        <div className="mt-2 w-80">
          <p className="text-left text-gray text-sm ml-2 pb-1">Birthday</p>
          <div className="relative w-full">
            <DatePicker
             label={"Birth date"} 
              value={birthday}
              onChange={setBirthday}
              className="w-full bg-[#29282C] text-sm text-gray rounded-2xl focus:outline-none focus:ring-2  "
              placeholder="dd/mm/yyyy"
              classNames={{
                calendar: "bg-[#29282C]",
              }}
            />
          </div>
        </div>
        <div className="mt-2 relative">
          <p className="text-left text-gray text-sm ml-2 pb-1">Country</p>
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

        <div className="mt-2">
          <p className="text-left text-gray text-sm ml-2 pb-1">Password</p>
          <PasswordInput
            text={"Password"}
            handleChange={handlePasswordChange}
            name={"password"}
            value={password}
          />
        </div>
        <div className="mt-2">
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
        <p className="pt-3 text-xs text-zinc-600 pb-5">
          Your password must have at least 8 characters, including <br />
          <span className="text-zinc-400">special characters</span>,{" "}
          <span className="text-zinc-400">capital letters</span>, and{" "}
          <span className="text-zinc-400">number</span>
        </p>
        <div className="flex justify-center space-x-4">
          <Button
            text={isLoading ? "Sending..." : "Create your account"}
            handleClick={!isLoading && isValid ? handleClick : () => {}}
            isActive={!isLoading && isValid}
          />
          <Button
            text={"Back"}
            handleClick={() => {
              setPage("intro");
            }}
            isActive={true}
          />
        </div>
        {error.length !== 0 && <p className="text-red-500 pt-4">{error}</p>}
        {isSuccessfully && (
          <p className="text-green-500 text-base pt-4">Sign up successfully</p>
        )}
      </div>
    </div>
  );
};

export default Infor;
