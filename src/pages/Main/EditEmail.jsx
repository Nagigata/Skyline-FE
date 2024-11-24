import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import Button from "../../components/Button";
import Input from "../../components/Input";

function isValidEmail(email) {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(String(email).toLowerCase());
}

function Email({ oldEmail, setCode, setNewEmail, setPage, signInKey }) {
    const [isValid, setValid] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState(oldEmail);

    const contentRef = useRef(null);

    useEffect(() => {
        const content = contentRef.current;
        gsap.fromTo(content, { opacity: 0 }, { opacity: 1, duration: 1 });
    }, []);

    const handleClick = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch('https://skn7vgp9-10000.asse.devtunnels.ms/api/user/email', {
                method: 'POST',
                headers: {
                    'x-api-key': 'abc-xyz-www',
                    'Content-Type': 'application/json',
                    'authorization': signInKey
                },
                body: JSON.stringify({
                    newEmail: email
                }),
            });
            const data = await response.json();
            
            if (response.status === 401) {
                setError('Your session has expired. Please sign in again.');
            } else if (response.status === 409) {
                setError('This email is already registered by another user.');
            } else if (!response.ok) {
                setError('An unknown error occurred.');
            } else {
                setNewEmail(email);
                setPage('code');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to send code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    useEffect(() => {
        setValid(isValidEmail(email) && email !== oldEmail);
    }, [email, oldEmail]);

    return (
        <div className="flex items-center justify-center bg-transparent" style={{ height: 'calc(100vh - 64px)' }}>
            <div ref={contentRef} className='bg-primary w-[500px] h-[400px] p-8 rounded-3xl shadow-2xl border-t-4 border-blueColor flex flex-col justify-center items-center'>
                <p className="bold text-2xl pb-7 text-blueColor">What is your new email?</p>
                <Input text={"Email address"} handleChange={handleEmailChange} name={"email"} value={email} />
                <div className="flex flex-col justify-center space-x-4 pt-8">
                    <p className="text-xs text-zinc-500 pb-2">Enter your new email to receive a verification code</p>
                    <Button
                        text={isLoading ? 'Processing...' : 'Send code to your new email'}
                        handleClick={(!isLoading && isValid) ? handleClick : () => { }}
                        isActive={!isLoading && isValid}
                    />
                </div>
                {error && <p className="text-xs text-red-500 pt-4">{error}</p>}
            </div>
        </div>
    );
}

function Code({ setPage, email, setUser, signInKey }) {
    const [enteredCode, setEnteredCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setLoading] = useState(false);

    const contentRef = useRef(null);

    useEffect(() => {
        const content = contentRef.current;
        gsap.fromTo(content, { opacity: 0 }, { opacity: 1, duration: 1 });
    }, []);

    const handleClick = async () => {
        setError('');
        setLoading(true);
        try {
            const response = await fetch('https://skn7vgp9-10000.asse.devtunnels.ms/api/user/email/check', {
                method: 'PATCH',
                headers: {
                    'x-api-key': 'abc-xyz-www',
                    'Content-Type': 'application/json',
                    'authorization': signInKey
                },
                body: JSON.stringify({
                    newEmail: email,
                    code: parseInt(enteredCode)
                }),
            });
            const data = await response.json();

            if (response.status === 401) {
                setError('Your session has expired. Please sign in again.');
            } else if (response.status === 400) {
                if (data.message === 'Expired Resource') {
                    setError('Verification code has expired. Please request a new code.');
                } else if (data.message === 'Incorrect Resource') {
                    setError('Incorrect verification code.');
                }
            } else if (response.status === 409) {
                setError('This email is already registered by another user.');
            } else if (!response.ok) {
                setError('An unknown error occurred.');
            } else {
                setUser(data.metadata.user);
                localStorage.setItem('signInKey', data.metadata.signInToken);
                setPage('email');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to verify code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (event) => {
        const code = event.target.value;
        setEnteredCode(code);
    };

    return (
        <div className="flex items-center justify-center bg-transparent" style={{ height: 'calc(100vh - 64px)' }}>
            <div ref={contentRef} className='bg-primary w-[500px] h-[400px] p-8 rounded-3xl shadow-2xl border-t-4 border-blueColor flex flex-col justify-center items-center'>
                <p className="bold text-2xl pb-7 text-blueColor">What's your received code?</p>
                <Input text={"Verify code"} handleChange={handleChange} name={"code"} value={enteredCode} />
                <p className="pt-2 text-xs text-zinc-600 pb-3">We sent a verification code to your new email, please check it!</p>
                <div className="pt-8 flex justify-center space-x-4">
                    <Button
                        text={isLoading ? 'Processing...' : 'Verify code'}
                        handleClick={(!isLoading && enteredCode.length !== 0) ? handleClick : () => { }}
                        isActive={(!isLoading && enteredCode.length !== 0)}
                    />
                </div>
                {error && <p className="text-xs text-red-500 pt-4">{error}</p>}
            </div>
        </div>
    );
}

export default function EditEmail({ user, setUser, signInKey }) {
    const [newEmail, setNewEmail] = useState('');
    const [page, setPage] = useState('email');

    return (
        <div>
            {page === "code" ?
                <Code setPage={setPage} email={newEmail} setUser={setUser} signInKey={signInKey} /> :
                <Email oldEmail={user.email} setNewEmail={setNewEmail} setPage={setPage} signInKey={signInKey} />}
        </div>
    );
}