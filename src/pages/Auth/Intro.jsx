import { useRef, useEffect} from 'react';
import { gsap } from 'gsap';
import Button from "../../components/Button";
import Logo from '../../components/Logo';

export default function Intro({ handleSignUpClick, handleSignInClick }) {
    const contentRef = useRef(null);
    const signInDivRef = useRef(null);

    useEffect(() => {
        const signInDiv = signInDivRef.current;
        const handleMouseEnter = (object) => {
            gsap.to(object, { scale: 0.9, duration: 0.2 });
        };
        const handleMouseLeave = (object) => {
            gsap.to(object, { scale: 1, duration: 0.2 });
        };
        signInDiv.addEventListener('mouseenter', () => handleMouseEnter(signInDiv));
        signInDiv.addEventListener('mouseleave', () => handleMouseLeave(signInDiv));
        return () => {
            signInDiv.removeEventListener('mouseenter', () => handleMouseEnter(signInDiv));
            signInDiv.removeEventListener('mouseleave', () => handleMouseLeave(signInDiv));
        };
    }, []);

    useEffect(() => {
        const content = contentRef.current;
        gsap.fromTo(content, { opacity: 0 }, { opacity: 1, duration: 1, delay: 1 });
    }, []);

    return (
        <div className="bg-primary flex flex-col w-full pt-10 border-t-4 border-blueColor rounded-lg">
            <Logo />
            <div ref={contentRef} className="flex space-x-40 justify-center items-top pt-40">
                <img className="w-[200px] pt-5" src="assets/images/intro1.png" alt="Intro" />
                <div className="flex flex-col">
                    <p className="text-gray bold text-xl pt-20 pb-10">
                        Live pics from your friends, <br /> on your home screen
                    </p>
                    <Button text={"Create an account"} handleClick={handleSignUpClick} isActive={true}/>
                    <div ref={signInDivRef} onClick={handleSignInClick} className="mt-4 bold text-gray p-2 cursor-pointer">Sign in</div>
                </div>
            </div>
        </div>
    );
}