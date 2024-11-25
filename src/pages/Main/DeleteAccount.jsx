import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Cookies from 'js-cookie';
import PasswordInput from '../../components/PasswordInput';

const DeleteAccount = ({ user, signInKey, signout }) => {
  const [code, setCode] = useState('');
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1); 
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);

  const contentRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const content = contentRef.current;
    gsap.fromTo(content, { opacity: 0 }, { opacity: 1, duration: 1 });
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startCountdown = () => {
    setTimeRemaining(300); 
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const sendDeletionCode = async () => {
    setError('');
    setProcessing(true);
    try {
      const response = await fetch(
        'https://skn7vgp9-10000.asse.devtunnels.ms/api/user/delete/check',
        {
          method: 'POST',
          headers: {
            'x-api-key': 'abc-xyz-www',
            'authorization': signInKey,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStep(2);
        startCountdown();
        setProcessing(false);
      } else {
        setError(data.message || 'Failed to send deletion code');
        setProcessing(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while sending deletion code');
      setProcessing(false);
    }
  };

  const deleteAccount = async () => {
    setError('');
    setProcessing(true);
    try {
      const response = await fetch(
        `https://skn7vgp9-10000.asse.devtunnels.ms/api/user?code=${code}`,
        {
          method: 'DELETE',
          headers: {
            'x-api-key': 'abc-xyz-www',
            'authorization': signInKey,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStep(3);
        setTimeout(() => {
          Cookies.remove('rememberMeEmail');
          Cookies.remove('rememberMePassword');
          signout();
        }, 2000);
      } else {
        setError(data.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while deleting the account');
    } finally {
      setProcessing(false);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h1 className="text-3xl bold text-red-500">Delete Account</h1>
            <p className="text-xs text-zinc-600 mb-14 mt-5 text-center">
              Click the button below to send a verification code to delete your account
            </p>
            <Button
              text={processing ? "Sending..." : "Send Deletion Code"} 
              handleClick={sendDeletionCode} 
              isActive={!processing}
            />
          </>
        );
      
      case 2:
        return (
          <>
            <h1 className="text-3xl bold text-red-500">Verify Deletion</h1>
            <p className="text-xs text-zinc-600 mb-5 mt-5 text-center">
              Enter the verification code sent to {user.email}
            </p>
            <p className="text-sm text-zinc-600 mb-5">
              Time remaining: {formatTime(timeRemaining)}
            </p>
            <Input
              text={'Verification Code'}
              handleChange={(e) => setCode(e.target.value)}
              name={'code'}
              value={code}
              type="number"
            />
            <div className='mt-10'></div>
            <Button
              text={processing ? "Deleting..." : "Confirm Delete Account"} 
              handleClick={deleteAccount} 
              isActive={!processing && code.length > 0 && timeRemaining > 0}
            />
          </>
        );
      
      case 3:
        return (
          <>
            <h1 className="text-3xl bold text-green-500">Account Deleted</h1>
            <p className="text-base text-zinc-600 mt-5 text-center">
              Your account has been successfully deleted. Goodbye!
            </p>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center items-center bg-transparent" style={{ height: 'calc(100vh - 64px)' }}>
      <div 
        ref={contentRef} 
        className="flex flex-col justify-center items-center bg-primary w-[500px] min-h-[400px] p-8 rounded-3xl shadow-2xl border-t-4 border-blueColor"
      >
        {renderContent()}
        {error && <p className="text-red-500 pt-4 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default DeleteAccount;