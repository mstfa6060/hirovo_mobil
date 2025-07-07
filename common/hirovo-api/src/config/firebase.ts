// @config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: 'AIzaSyDKxxAAHLTNd6B9uDNHhF_5510AOaRlL5E',
    authDomain: 'hirovo-firabase.firebaseapp.com',
    projectId: 'hirovo-firabase',
    storageBucket: 'hirovo-firabase.appspot.com',
    messagingSenderId: '88926208060',
    appId: '1:88926208060:android:31be74ceab224a024f4339',
};

const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
