import { useCallback, useEffect, useState } from 'react';
import Modal from './Modal';
import { useAppDispatch } from '../redux/store';
import LoadingButton from './LoadingButton';
import LoginWithGoogleButton from './LoginWithGoogleButton';
import Input from './Input';
import { isEmail, isMobilePhone } from 'validator';
import { loginWithPhoneNumber, useIsLoginWithPhoneNumberLoading } from '../redux/auth/loginWithPhoneNumber';
import { loginWithEmail, useIsLoginWithEmailLoading } from '../redux/auth/loginWithEmail';
import { RecaptchaVerifier } from 'firebase/auth';
import { firebaseAuth } from '@/components/firebase/firebaseAuth';
import { showToast } from '@/components/redux/toast/toastSlice';
import {
    useVerifyPhoneNumberLoading,
    verifyPhoneNumber,
} from '../redux/auth/verifyPhoneNumber';
import { useRouter } from 'next/navigation';


interface SignUpModalProps {
    open: boolean;
    setOpen: (show: boolean) => void;
}
const SignUpModal = (props: SignUpModalProps) => {
    const dispatch = useAppDispatch();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [disableSubmitEmail, setDisableSubmitEmail] = useState(true);
    const [disableSubmitPhone, setDisableSubmitPhone] = useState(true);

    const [OTPCode, setOTPCode] = useState('');
    const [show, setShow] = useState(false);

    const verifyPhoneNumberLoading = useVerifyPhoneNumberLoading();

    const [recaptcha, setRecaptcha] = useState<RecaptchaVerifier | null>(null);
    const [recaptchaResolved, setRecaptchaResolved] = useState(false);
    const [verificationId, setVerificationId] = useState('');

    const isLoadingEmail = useIsLoginWithEmailLoading();
    const isLoadingPhone = useIsLoginWithPhoneNumberLoading();
    const router = useRouter();

    useEffect(() => {
        if (isEmail(email) && password.length >= 6) {
            setDisableSubmitEmail(false);
        } else {
            setDisableSubmitEmail(true);
        }
    }, [email, password]);

    useEffect(() => {
        if (isMobilePhone(phoneNumber) && recaptchaResolved) {
            setDisableSubmitPhone(false);
        } else {
            setDisableSubmitPhone(true);
        }
    }, [phoneNumber, recaptchaResolved]);

    // generating the recaptcha on page render
    useEffect(() => {
        const captcha = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
            size: 'normal',
            callback: () => {
                setRecaptchaResolved(true);
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
    }, []);


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

    // Signup with email and password and redirecting to home page
    const signUpWithEmail = useCallback(async () => {
        // verify the user email before signup
        dispatch(
            loginWithEmail({
                type: 'sign-up',
                email,
                password,
            })
        );

        /* if (credentials.user.emailVerified === false) {
                await sendEmailVerification(credentials.user);

                dispatch(
                    showToast({
                        message: 'Verification Email has been sent to your Email',
                        type: 'success',
                    })
                );
            } */

        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [email, password, dispatch]);
    
    // Signup with phone number and redirecting to home page
    const signUpWithPhoneNumber = useCallback(async () => {
        // verify the user number before signup
        dispatch(
            loginWithPhoneNumber({
                type: 'sign-up',
                phoneNumber,
                recaptcha,
                callback: (result) => {
                    if (result.type === 'error') {
                        setRecaptchaResolved(false);
                        return;
                    }
                    setVerificationId(result.verificationId);
                    setShow(true);
                },
            })
        );
        setShow(true);
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [phoneNumber, recaptcha, dispatch]);

    return (
        <Modal show={props.open} setShow={props.setOpen}>
            <div className="max-w-md w-full bg-white py-6 rounded-lg">
                <h2 className="text-lg font-semibold text-center mb-10">Sign Up</h2>
                <div className="px-4 flex p-4 pb-10 gap-4 flex-col">
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
                        onClick={signUpWithEmail}
                        disabled={disableSubmitEmail}
                        loading={isLoadingEmail}
                    >
                        Sign Up
                    </LoadingButton>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-gray-500">Or sign up with</span>
                        </div>
                    </div>
                    <Input
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Phone Number"
                        name="phoneNumber"
                        type="text"
                    />
                    <div id="recaptcha-container" />
                    <LoadingButton
                        onClick={signUpWithPhoneNumber}
                        disabled={disableSubmitPhone}
                        loading={isLoadingPhone}
                    >
                        Sign Up
                    </LoadingButton>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-gray-500">Or sign up with</span>
                        </div>
                    </div>
                    <div className="mt-2 grid grid-cols-1 gap-3">
                        <LoginWithGoogleButton />
                    </div>

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
        </Modal>
    );
};

export default SignUpModal;
