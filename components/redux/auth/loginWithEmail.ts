import { createAsyncThunk } from '@reduxjs/toolkit';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateEmail, updatePassword } from 'firebase/auth';
import { firebaseAuth } from '@/components/firebase/firebaseAuth';
import { getFriendlyMessageFromFirebaseErrorCode } from './helpers';
import { showToast } from '../toast/toastSlice';
import isEmail from 'validator/lib/isEmail';
import { useAppSelector } from '../store';
import { LoadingStateTypes } from '../types';
import { AuthContextType } from '@/components/useAuth';

export const loginWithEmail = createAsyncThunk(
    'loginEmail',
    async (args: { type: 'login' | 'sign-up' | 'link'; auth: AuthContextType | null; email: string; password: string;
    callback: (
        args:
            | { type: 'success'; }
            | {
                  type: 'error';
                  message: string;
              }
    ) => void,  
}, { dispatch }) => {
        try {
            if (!isEmail(args.email)) {
                dispatch(
                    showToast({
                        message: 'Enter a valid email',
                        type: 'info',
                    })
                );
                return;
            }
            if (args.password.length < 6) {
                dispatch(
                    showToast({
                        message: 'Password should be atleast 6 characters',
                        type: 'info',
                    })
                );
                return;
            }

            if (args.type === 'sign-up') {
                await createUserWithEmailAndPassword(firebaseAuth, args.email, args.password);
            }
            if (args.type === 'link' && args.auth?.type === LoadingStateTypes.LOADED){

                    await updatePassword(args.auth.user, args.password);
                    await updateEmail(args.auth.user, args.email);

                    dispatch(
                        showToast({
                            message: 'Email and password linked succesfully',
                            type: 'success',
                        })
                    );
                    if (args.callback)
                        args.callback({
                            type: 'success'
                    });
            }

            await signInWithEmailAndPassword(firebaseAuth, args.email, args.password);
        } catch (e: any) {
            console.log(e);
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

export const useIsLoginWithEmailLoading = () => {
    const loading = useAppSelector((state) => state.loading.loginWithEmail);
    return loading;
};
