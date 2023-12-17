// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDNkwfj3huNmP3-Z9Xkxtd1CplnXUUBR5k",
  authDomain: "ideaaltice-f5e4b.firebaseapp.com",
  projectId: "ideaaltice-f5e4b",
  storageBucket: "ideaaltice-f5e4b.appspot.com",
  messagingSenderId: "263082356588",
  appId: "1:263082356588:web:f8755aeb86e49b3d01cd49",
  measurementId: "G-CGLD3LYKFZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export default getFirestore();