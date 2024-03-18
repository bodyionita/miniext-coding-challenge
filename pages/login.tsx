/* eslint-disable @next/next/no-img-element */
import { NextPage } from 'next';
import { GoogleAuthProvider, RecaptchaVerifier } from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ToastBox from '@/components/ui/ToastBox';
import { useAppDispatch } from '@/components/redux/store';
import { useAuth } from '@/components/useAuth';
import Spinner from '@/components/Spinner';
import LoginWithGoogleButton from '@/components/ui/LoginWithGoogleButton';
import Input from '@/components/ui/Input';
import LoadingButton from '@/components/ui/LoadingButton';
import SignUpModal from '@/components/ui/SignUpModal';
import { loginWithEmail, useIsLoginWithEmailLoading } from '@/components/redux/auth/loginWithEmail';
import { LoadingStateTypes } from '@/components/redux/types';
import { loginWithPhoneNumber, useIsLoginWithPhoneNumberLoading } from '@/components/redux/auth/loginWithPhoneNumber';
import {
    useVerifyPhoneNumberLoading,
    verifyPhoneNumber,
} from '../components/redux/auth/verifyPhoneNumber';
import { firebaseAuth } from '@/components/firebase/firebaseAuth';
import { showToast } from '@/components/redux/toast/toastSlice';
import Modal from '@/components/ui/Modal';

export const googleLoginProvider = new GoogleAuthProvider();

const LoginPage: NextPage = () => {
    const dispatch = useAppDispatch();
    const auth = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [disableSubmitEmail, setDisableSubmitEmail] = useState(true);
    const [disableSubmitPhoneNumber, setDisableSubmitPhoneNumber] = useState(true);
    const isLoadingEmail = useIsLoginWithEmailLoading();
    const isLoadingPhoneNumber = useIsLoginWithPhoneNumberLoading();

    const [OTPCode, setOTPCode] = useState('');
    const [show, setShow] = useState(false);
    const verifyPhoneNumberLoading = useVerifyPhoneNumberLoading();

    const [recaptcha, setRecaptcha] = useState<RecaptchaVerifier | null>(null);
    const [recaptchaResolved, setRecaptchaResolved] = useState(false);
    const [verificationId, setVerificationId] = useState('');

    const [showRegistration, setshowRegistration] = useState(false);
    const router = useRouter();
    

    // Realtime validation to enable submit button
    useEffect(() => {
        if (email && password.length >= 6) {
            setDisableSubmitEmail(false);
        } else {
            setDisableSubmitEmail(true);
        }
    }, [email, password]);

    // Realtime validation to enable submit button
    useEffect(() => {
        if (phoneNumber && recaptchaResolved) {
            setDisableSubmitPhoneNumber(false);
        } else {
            setDisableSubmitPhoneNumber(true);
        }
    }, [phoneNumber, recaptchaResolved]);

    // generating the recaptcha on page render
    useEffect(() => {
        // TODO: ugly but working way of loading the captcha only after the page has loaded 
        // and the user starts typing the phone number. also makes sure the captcha is not reinitialised
        if (recaptcha !== null || phoneNumber === null || phoneNumber === '') return;
        const captcha = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container-sign-in', {
            size: 'compact',
            callback: () => {
                setRecaptchaResolved(true);
                console.log("captcha solved");
                
            },
            'expired-callback': () => {
                setRecaptchaResolved(false);
                dispatch(
                    showToast({
                        message: 'Recaptcha Expired, please verify it again',
                        type: 'info',
                    })
                );
            },
        });

        captcha.render();

        setRecaptcha(captcha);
    }, [phoneNumber]);

    // Validating the filled OTP by user
    const ValidateOtp = async () => {
        dispatch(
            verifyPhoneNumber({
                type: 'sign-up',
                OTPCode,
                auth: null,
                verificationId,
                callback: (result) => {
                    if (result.type === 'error') {
                        return;
                    }
                    // needed to reload auth user
                    router.refresh();
                },
            })
        );
    };

    // Signing in with email and password and redirecting to home page
    const signInWithEmail = useCallback(async () => {
        await dispatch(
            loginWithEmail({
                type: 'login',
                auth: null,
                email,
                password,
                callback: (result) => {
                    if (result.type === 'error') {
                        return;
                    }
                },
            })
        );
    }, [email, password, dispatch]);

   

    // Signup with phone number and redirecting to home page
    const signInWithPhoneNumber = useCallback(async () => {
        // verify the user number before signup
        dispatch(
            loginWithPhoneNumber({
                type: 'login',
                phoneNumber,
                recaptcha,
                callback: (result) => {
                    if (result.type === 'error') {
                        setRecaptchaResolved(false);
                        return;
                    }
                    // get the verification id for the OTP validation
                    setVerificationId(result.verificationId);
                    setShow(true);
                },
            })
        );
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [phoneNumber, recaptcha, dispatch]);


    if (auth.type === LoadingStateTypes.LOADING) {
        return <Spinner />;
    } else if (auth.type === LoadingStateTypes.LOADED) {
        router.push('/');
        return <Spinner />;
    }
    
    return (
        <div className="flex items-center justify-center min-h-full px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="max-w-xl w-full rounded overflow-hidden shadow-lg py-2 px-4">
                    <div className="flex gap-4 mb-5 flex-col">
                        <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            name="email"
                            type="text"
                        />
                        <Input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            name="password"
                            type="password"
                        />
                        <LoadingButton
                            onClick={signInWithEmail}
                            disabled={disableSubmitEmail}
                            loading={isLoadingEmail}
                        >
                            Sign In
                        </LoadingButton>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-2 text-gray-500">Or login with</span>
                            </div>
                        </div>
                        <Input
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Phone number"
                            name="phoneNumber"
                            type="text"
                        />
                        <div id="recaptcha-container-sign-in" />
                        <LoadingButton
                            onClick={signInWithPhoneNumber}
                            disabled={disableSubmitPhoneNumber}
                            loading={isLoadingPhoneNumber}
                        >
                            Sign In
                        </LoadingButton>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-2 text-gray-500">Or login with</span>
                            </div>
                        </div>
                        <div className="mt-2 grid grid-cols-1 gap-3">
                            <LoginWithGoogleButton />
                        </div>
                        <div className="mt-6">
                            <div className="flex justify-center">
                                <div className="relative flex justify-center text-sm">
                                    <div className="font-small text-black-400">
                                        Don&apos;t have an account?
                                    </div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <div
                                        onClick={() => setshowRegistration(true)}
                                        className="ml-2 cursor-pointer font-medium text-violet-600 hover:text-violet-400"
                                    >
                                        Sign Up
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <SignUpModal open={showRegistration} setOpen={setshowRegistration} />
                    <Modal show={show} setShow={setShow}>
                        <div className="max-w-xl w-full bg-white py-6 rounded-lg">
                            <h2 className="text-lg font-semibold text-center mb-10">
                                Enter Code to Verify
                            </h2>
                            <div className="px-4 flex items-center gap-4 pb-10">
                                <Input
                                    value={OTPCode}
                                    type="text"
                                    placeholder="Enter your OTP"
                                    onChange={(e) => setOTPCode(e.target.value)}
                                />

                                <LoadingButton
                                    onClick={ValidateOtp}
                                    loading={verifyPhoneNumberLoading}
                                    loadingText="Verifying..."
                                >
                                    Verify
                                </LoadingButton>
                            </div>
                        </div>
                    </Modal>
                </div>
            </div>
            <ToastBox />
        </div>
    );
};

export default LoginPage;
