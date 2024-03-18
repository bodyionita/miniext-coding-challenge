// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { /* connectFirestoreEmulator, */ getFirestore } from 'firebase/firestore';
// import { /* connectStorageEmulator, */ getStorage } from 'firebase/storage';
// import { isDev } from '../isDev';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBdj1BzVT-4Sf163Y4aNMSSVKnN_yHpudY",
    authDomain: "miniext-challenge-6efe4.firebaseapp.com",
    projectId: "miniext-challenge-6efe4",
    storageBucket: "miniext-challenge-6efe4.appspot.com",
    messagingSenderId: "340605091743",
    appId: "1:340605091743:web:511c43a748e2396535c7aa"
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);

export const firestore = getFirestore(firebaseApp);
export const baseBucketName = 'miniext-challenge-6efe4.appspot.com';

/* if (isDev) {
    connectFirestoreEmulator(firestore, '127.0.0.1', 8081);
} */
