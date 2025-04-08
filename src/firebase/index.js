// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  // apiKey: "AIzaSyAn4uWO9RM55U2WQtW3u8eVyZKJnx9U0mA",
  // authDomain: "proj-instrumentacao.firebaseapp.com",
  // databaseURL: "https://proj-instrumentacao-default-rtdb.firebaseio.com",
  // projectId: "proj-instrumentacao",
  // storageBucket: "proj-instrumentacao.appspot.com",
  // messagingSenderId: "537585150415",
  // appId: "1:537585150415:web:32e3c728fa7610dbfe8aba",
  // measurementId: "G-8RZD106MS8",
  // databaseURL: "https://proj-instrumentacao-default-rtdb.firebaseio.com/",
  
  apiKey: "AIzaSyDPtW4UG8H87E1bPjXHsluoDiKS6dAU7Os",
  authDomain: "irrigacao-60d02.firebaseapp.com",
  databaseURL: "https://irrigacao-60d02-default-rtdb.firebaseio.com",
  projectId: "irrigacao-60d02",
  storageBucket: "irrigacao-60d02.appspot.com",
  messagingSenderId: "60564126590",
  appId: "1:60564126590:web:2aee9e97901a66e69dd12f",
  measurementId: "G-8Y3NFHVX8J",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
// Initialize Realtime Database and get a reference to the service
export const db = getDatabase(app);