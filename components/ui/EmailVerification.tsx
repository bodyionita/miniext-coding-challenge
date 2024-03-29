/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch } from '../redux/store';
import Logout from './Logout';
import { useAuth } from '../useAuth';
import Input from '@/components/ui/Input';
import LinkWithGoogleButton from './LinkWithGoogleButton';
import LoadingButton from '@/components/ui/LoadingButton';
import ToastBox from './ToastBox';
import { loginWithEmail, useIsLoginWithEmailLoading } from '../redux/auth/loginWithEmail';
import React from 'react';
import { isEmail } from 'validator';
import { LoadingStateTypes } from '../redux/types';
import { useRouter } from 'next/navigation';
import Modal from './Modal';

const EmailVerification = () => {  
    const dispatch = useAppDispatch();  
    const auth = useAuth();
    const [show, setShow] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const isLoadingEmail = useIsLoginWithEmailLoading();
    const [disableSubmitEmail, setDisableSubmitEmail] = useState(true);
    const router = useRouter();
    // Link the email and password to the user and redirecting to home page
    const linkEmail = useCallback(async () => {
        if (auth.type !== LoadingStateTypes.LOADED) return;
        dispatch(
            loginWithEmail({
                type: 'link',
                auth,
                email,
                password,
                callback: (result) => {
                    if (result.type === 'error') {
                        setShow(true);
                        return;
                    }
                    // needed to reload auth user
                    router.refresh();
                },
            })
        );

        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [email, password, dispatch]);

    useEffect(() => {
        if (isEmail(email) && password.length >= 6) {
            setDisableSubmitEmail(false);
        } else {
            setDisableSubmitEmail(true);
        }
    }, [email, password]);

    return (
        <div className="flex items-center justify-center min-h-full px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <img
                        className="w-auto h-12 mx-auto"
                        src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
                        alt="Workflow"
                    />
                    <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
                        Add e-mail to your account
                    </h2>
                </div>

                <div className="max-w-xl w-full rounded overflow-hidden shadow-lg py-2 px-4">
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
                            onClick={linkEmail}
                            loading={isLoadingEmail}
                            disabled={disableSubmitEmail}
                            loadingText="Associating e-mail"
                        >
                            Link e-mail 
                        </LoadingButton>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-2 text-gray-500">Or link with</span>
                            </div>
                        </div>
                        <div className="mt-2 grid grid-cols-1 gap-3">
                            <LinkWithGoogleButton />
                        </div>
                    </div>
                    <Modal show={show} setShow={setShow}>
                        <div className="max-w-md w-full bg-white py-6 rounded-lg">
                            <h2 className="text-lg font-semibold text-center mb-10">
                                Please logout and sign back in to link your email.
                            </h2>
                            <div className="px-4 flex items-center gap-4 pb-10">
                                <div className="flex w-full flex-col">
                                    <Logout />
                                </div>
                            </div>
                        </div>
                    </Modal>

                    <div className="flex w-full flex-col">
                        <Logout />
                    </div>
                </div>
            </div>
            <ToastBox />
        </div>
    );
};

export default EmailVerification;
