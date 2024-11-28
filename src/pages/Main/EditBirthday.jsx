import { useState, useRef, useEffect } from "react";
import Button from "../../components/Button";
import { DatePicker } from "@nextui-org/react";
import { parseDate } from "@internationalized/date";
import gsap from "gsap";

const getDate = ({ day, month, year }) => {
  if (!day || !month || !year) return null;
  
  const formattedDay = day.toString().length === 1 ? `0${day}` : day.toString();
  const formattedMonth = month.toString().length === 1 ? `0${month}` : month.toString();
  return `${formattedDay}/${formattedMonth}/${year}`;
};

const changeFormatBirthday = ({ day, month, year }) => {
  if (!day || !month || !year) return null;
  return `${year}-${month}-${day}`;
};

const parseBirthday = (birthdayString) => {
  if (!birthdayString) return null;
  
  const parts = birthdayString.split("/");
  if (parts.length !== 3) return null;
  
  return {
    day: parts[0],
    month: parts[1],
    year: parts[2]
  };
};

export default function EditBirthday({ user, setUser, signInKey }) {
  // Xử lý khởi tạo birthday từ user
  const oldBirthday = parseBirthday(user?.birthday);
  const [birthday, setBirthday] = useState(() => {
    if (!oldBirthday) return null;
    
    const formattedDate = changeFormatBirthday(oldBirthday);
    if (!formattedDate) return null;
    
    try {
      return parseDate(formattedDate);
    } catch {
      return null;
    }
  });

  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const contentRef = useRef(null);

  useEffect(() => {
    const content = contentRef.current;
    gsap.fromTo(content, { opacity: 0 }, { opacity: 1, duration: 1 });
  }, []);

  useEffect(() => {
    if (birthday) {
      const currentYear = new Date().getFullYear();
      const isValidDate = 
        birthday.year < currentYear &&
        birthday.year > 1950 &&
        getDate(birthday) !== user?.birthday;
      
      setIsValid(isValidDate);
    } else {
      setIsValid(false);
    }
  }, [birthday, user?.birthday]);

  const handleClick = async () => {
    if (!birthday) {
      setError("Please select a valid birthday.");
      return;
    }

    const formattedDate = getDate(birthday);
    if (!formattedDate) {
      setError("Invalid date format.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        "https://skn7vgp9-10000.asse.devtunnels.ms/api/user/birthday",
        {
          method: "PATCH",
          headers: {
            "x-api-key": "abc-xyz-www",
            "Content-Type": "application/json",
            authorization: signInKey,
          },
          body: JSON.stringify({
            birthday: formattedDate,
          }),
        }
      );
      const data = await response.json();
      
      if (!response.ok) {
        switch (data.message) {
          case "API key is required":
            setError("API key is required.");
            break;
          case "API key is incorrect":
            setError("API key is incorrect.");
            break;
          case "Birthday is required":
            setError("Birthday is required.");
            break;
          default:
            setError("An unknown error occurred.");
        }
      } else {
        setUser(data.metadata);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to save birthday. Please try again.");
    } finally {
      setIsLoading(false);
      setIsValid(false);
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
          What's your birthday?
        </p>
        <div className="mt-2 relative">
          <DatePicker
            value={birthday}
            onChange={setBirthday}
            className="bg-[#29282C] text-sm text-gray rounded-2xl p-3 w-80 focus:outline-none focus:ring-2 flex items-center justify-center"
          />
          <div className="absolute bg-[#29282C] w-6 h-6 top-4 right-8"></div>
        </div>
        <div className="pt-8 flex justify-center space-x-4">
          <Button
            text={isLoading ? "Processing..." : "Save your birthday"}
            handleClick={!isLoading && isValid ? handleClick : () => {}}
            isActive={!isLoading && isValid}
          />
        </div>
        {error && <p className="text-xs text-red-500 pt-4">{error}</p>}
      </div>
    </div>
  );
}