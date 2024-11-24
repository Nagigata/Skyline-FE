import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Cookies from 'js-cookie';
import PasswordInput from '../../components/PasswordInput';

const DeleteAccount = ({ user, signInKey, signout }) => {
  const [fullname, setFullname] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const contentRef = useRef(null);

  useEffect(() => {
    const content = contentRef.current;
    gsap.fromTo(content, { opacity: 0 }, { opacity: 1, duration: 1 });
  }, []);

  useEffect(() => {
    if (fullname === `${user.fullname.firstname} ${user.fullname.lastname}` && password.length !== 0) {
      setConfirm(true);
    } else {
      setConfirm(false);
    }
  }, [fullname, password]);

  const handleChange = (event) => {
    setFullname(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const deleteAccountHandler = async () => {
    setError('');
    setProcessing(true);
    try {
      const signInResponse = await fetch(
        'https://skn7vgp9-10000.asse.devtunnels.ms/access/sign-in',
        {
          method: 'POST',
          headers: {
            'api-key': 'ABC-XYZ-WWW',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            password: password
          }),
        }
      );

      if (!signInResponse.ok) {
        const signInData = await signInResponse.json();
        switch (signInData.message) {
          case 'API key is required':
            setError('API key is required.');
            break;
          case 'API key is incorrect':
            setError('API key is incorrect.');
            break;
          case 'Data is required':
            setError('Data is required.');
            break;
          case 'Email is not registered':
            setError('Email is not registered.');
            break;
          case 'Password is incorrect':
            setError('Password is incorrect.');
            break;
          default:
            setError('An unknown error occurred.');
        }
        return;
      }

      const deleteResponse = await fetch('https://skn7vgp9-10000.asse.devtunnels.ms/account/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'api-key': 'ABC-XYZ-WWW',
          'authorization': signInKey,
          'user-id': user?._id
        }
      });

      if (!deleteResponse.ok) {
        const deleteData = await deleteResponse.json();
        setError(deleteData.message || 'Failed to delete account.');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        Cookies.remove('rememberMeEmail');
        Cookies.remove('rememberMePassword');
        signout();
      }, 2000);

    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while deleting the account.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex justify-center items-center bg-transparent" style={{ height: 'calc(100vh - 64px)' }}>
      <div ref={contentRef} className="flex flex-col justify-center items-center bg-primary w-[500px] h-[400px] p-8 rounded-3xl shadow-2xl border-t-4 border-blueColor">
        <h1 className="text-3xl bold text-red-500">Delete Account</h1>
        <p className="text-xs text-zinc-600 mb-14 mt5">Enter your fullname along with your password <br></br> correctly to be processed</p>
        <div>
          <Input
            text={'Fullname'}
            handleChange={handleChange}
            name={'fullname'}
            value={fullname}
          />
          <div className="pb-3"></div>
          <PasswordInput text={"Your password"} handleChange={handlePasswordChange} name={"password"} value={password} />
          <div className='mt-10'></div>
          <Button
            text={processing ? "Processing..." : "Delete your account"} 
            handleClick={(!processing && confirm) ? deleteAccountHandler : () => {}} 
            isActive={!processing && confirm}
          />
        </div>
        {success && (
          <p className="text-green-500 text-base pt-4 pb-4">Delete account successfully. Goodbye!</p>
        )}
        {error && <p className="text-red-500 pt-4">{error}</p>}
      </div>
    </div>
  );
};

export default DeleteAccount;
