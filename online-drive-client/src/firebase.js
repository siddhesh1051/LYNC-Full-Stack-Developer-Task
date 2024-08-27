import axios from "axios";
import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { query, where, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

async function addFolder(name, uid, currentFolder, path) {
  if (currentFolder === null) return;

  const folderQuery = query(
    collection(db, "folders"),
    where("name", "==", name),
    where("parentId", "==", currentFolder.id),
    where("uid", "==", uid)
  );

  const querySnapshot = await getDocs(folderQuery);

  if (!querySnapshot.empty) {
    alert("A folder with this name already exists in the current directory.");
    return;
  }

  try {
    await addDoc(collection(db, "folders"), {
      name: name,
      uid: uid,
      parentId: currentFolder.id,
      path: path,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    alert("Error adding document: ", e);
  }
}

async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log(result.user);

    // Send data to your backend API
    await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
      name: result.user.displayName,
      email: result.user.email,
      password: "googleAuth",
    });
  } catch (error) {
    console.log(error.message);
  }
}

async function logInWithEmailAndPassword(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log(userCredential.user);

    // Send login data to your backend API
    await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
      email,
      password,
    });
  } catch (err) {
    console.error(err.message);
    alert(err.message);
  }
}

async function registerWithEmailAndPassword(name, email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await updateProfile(userCredential.user, { displayName: name });

    // Send registration data to your backend API
    await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
      name,
      email,
      password,
    });
  } catch (error) {
    console.log(error.message);
  }
}

async function sendPasswordReset(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset link sent!");
  } catch (error) {
    console.error(error.message);
  }
}

function logout() {
  signOut(auth);
}

export {
  auth,
  addFolder,
  signInWithGoogle,
  logInWithEmailAndPassword,
  registerWithEmailAndPassword,
  sendPasswordReset,
  logout,
};
