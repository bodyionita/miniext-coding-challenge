import { createAsyncThunk } from '@reduxjs/toolkit';
import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { firebaseAuth } from '@/components/firebase/firebaseAuth';
import { getFriendlyMessageFromFirebaseErrorCode } from './helpers';
import { showToast } from '../toast/toastSlice';
import isPhoneNumber from 'validator/lib/isMobilePhone';
import { useAppSelector } from '../store';

export const loginWithPhoneNumber = createAsyncThunk(
    'loginPhone',
    async (args: { type: 'login' | 'sign-up',
        phoneNumber: string,
        recaptcha: RecaptchaVerifier | null,
        callback: (
            args:
                | { type: 'success'; verificationId: string }
                | {
                      type: 'error';
                      message: string;
                  }
        ) => void,    
    }, { dispatch }) => {
        try {
            if (!isPhoneNumber(args.phoneNumber)) {
                dispatch(
                    showToast({
                        message: 'Enter a valid phone number',
                        type: 'info',
                    })
                );
                return;
            }
            if (args.recaptcha === null)
            {
                dispatch(
                    showToast({
                        message: 'Captcha is invalid',
                        type: 'info',
                    })
                );
                return;
            }
            const confirmationCode = await signInWithPhoneNumber(firebaseAuth, args.phoneNumber, args.recaptcha);
            if (args.callback)
                args.callback({
                    type: 'success',
                    verificationId: confirmationCode.verificationId,
                });
            
        } catch (e: any) {
            dispatch(
                showToast({
                    message: getFriendlyMessageFromFirebaseErrorCode(e.code),
                    type: 'error',
                })
            );
            if (args.callback)
                args.callback({
                    type: 'error',
                    message: getFriendlyMessageFromFirebaseErrorCode(e.code),
                });
        }
    }
);

export const useIsLoginWithPhoneNumberLoading = () => {
    const loading = useAppSelector((state) => state.loading.loginWithPhoneNumber);
    return loading;
};
