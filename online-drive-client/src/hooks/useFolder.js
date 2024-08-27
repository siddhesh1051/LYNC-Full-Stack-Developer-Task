import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useReducer, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const ACTIONS = {
  SELECT_FOLDER: "select-folder",
  UPDATE_FOLDER: "update-folder",
  SET_CHILD_FOLDERS: "set-child-folders",
  SET_CHILD_FILES: "set-child-files",
  SET_LOADING: "set-loading",
  SET_ERROR: "set-error",
};

export const ROOT_FOLDER = { name: "Root", id: null, path: [] };

function reducer(state, { type, payload }) {
  switch (type) {
    case ACTIONS.SELECT_FOLDER:
      return {
        ...state,
        folderId: payload.folderId,
        folder: payload.folder,
        childFiles: [],
        childFolders: [],
      };
    case ACTIONS.UPDATE_FOLDER:
      return {
        ...state,
        folder: payload.folder,
        loading: false,
      };
    case ACTIONS.SET_CHILD_FOLDERS:
      return {
        ...state,
        childFolders: payload.childFolders,
      };
    case ACTIONS.SET_CHILD_FILES:
      return {
        ...state,
        childFiles: payload.childFiles,
      };
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: payload.loading,
      };
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: payload.error,
        loading: false,
      };
    default:
      return state;
  }
}

export function useFolder(folderId = null, folder = null) {
  const [state, dispatch] = useReducer(reducer, {
    folderId,
    folder,
    childFolders: [],
    childFiles: [],
    loading: true,
    error: null,
  });
  const [user] = useAuthState(auth);

  useEffect(() => {
    dispatch({ type: ACTIONS.SELECT_FOLDER, payload: { folderId, folder } });
  }, [folderId, folder]);

  useEffect(() => {
    if (folderId == null) {
      return dispatch({
        type: ACTIONS.UPDATE_FOLDER,
        payload: { folder: ROOT_FOLDER },
      });
    }

    async function getFolder(folderId) {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { loading: true } });

      try {
        const docRef = doc(db, "folders", folderId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          dispatch({
            type: ACTIONS.UPDATE_FOLDER,
            payload: { folder: { id: docSnap.id, ...docSnap.data() } },
          });
        } else {
          dispatch({
            type: ACTIONS.UPDATE_FOLDER,
            payload: { folder: ROOT_FOLDER },
          });
        }
      } catch (e) {
        dispatch({
          type: ACTIONS.SET_ERROR,
          payload: { error: e.message },
        });
      }
    }

    getFolder(folderId);
  }, [folderId]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "folders"),
      where("parentId", "==", folderId),
      where("uid", "==", user.uid),
      orderBy("createdAt")
    );

    return onSnapshot(q, (querySnapshot) => {
      dispatch({
        type: ACTIONS.SET_CHILD_FOLDERS,
        payload: {
          childFolders: querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
        },
      });
    });
  }, [folderId, user]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "files"),
      where("folderId", "==", folderId),
      where("userId", "==", user.uid),
      orderBy("createdAt")
    );

    return onSnapshot(q, (querySnapshot) => {
      dispatch({
        type: ACTIONS.SET_CHILD_FILES,
        payload: {
          childFiles: querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
        },
      });
    });
  }, [folderId, user]);

  return state;
}
