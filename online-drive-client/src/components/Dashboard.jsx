import React, { useState, useEffect, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate, useParams } from "react-router-dom";
import { auth, logout, storage, db } from "../firebase";
import { ROOT_FOLDER, useFolder } from "../hooks/useFolder";
import BreadCrumbs from "./BreadCrumbs";
import Folder from "./Folder";
import ModalFolder from "./ModalFolder";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import File from "./File";
import Sidebar from "./Sidebar";
import { AiOutlineSearch } from "react-icons/ai";
import { RxCross2 } from "react-icons/rx";

function Dashboard() {
  const { folderId } = useParams();
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const { folder, childFolders, childFiles } = useFolder(folderId);
  const [isModal, setIsModal] = useState(false);
  const [uploadFileState, setUploadFileState] = useState({
    progress: null,
    name: null,
    error: false,
  });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFolders, setFilteredFolders] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const userMenuRef = useRef(null);
  const avatarRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target) &&
        !avatarRef.current.contains(event.target)
      ) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    function handleSearchClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setFilteredFolders([]);
        setFilteredFiles([]);
      }
    }
    document.addEventListener("mousedown", handleSearchClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleSearchClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchTerm.trim() !== "") {
      const filteredFolders = childFolders.filter((folder) =>
        folder.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const filteredFiles = childFiles.filter((file) =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFolders(filteredFolders);
      setFilteredFiles(filteredFiles);
    } else {
      setFilteredFolders([]);
      setFilteredFiles([]);
    }
  }, [searchTerm, childFolders, childFiles]);

  function uploadFile(e) {
    const file = e.target.files[0];
    if (!folder || !file) return;

    const filePath =
      folder === ROOT_FOLDER
        ? `${folder.path.join("/")}/${file.name}`
        : `${folder.path.join("/")}/${folder.name}/${file.name}`;

    const storageRef = ref(storage, `/files/${user.uid}/${filePath}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadFileState({
          ...uploadFileState,
          name: file.name,
          progress: progress,
        });
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        console.error("Upload failed", error);
        setUploadFileState({
          name: file.name,
          progress: 100,
          error: true,
        });
      },
      () => {
        setUploadFileState({
          name: null,
          progress: null,
          error: false,
        });
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadUrl) => {
          const q = query(
            collection(db, "files"),
            where("name", "==", file.name),
            where("userId", "==", user.uid),
            where("folderId", "==", folder.id)
          );

          getDocs(q).then(async (existingFiles) => {
            const existingFile = existingFiles.docs[0];
            if (existingFile?.exists()) {
              await updateDoc(existingFile.ref, {
                createdAt: serverTimestamp(),
                url: downloadUrl,
              });
            } else {
              await addDoc(collection(db, "files"), {
                url: downloadUrl,
                name: file.name,
                createdAt: serverTimestamp(),
                folderId: folder.id,
                userId: user.uid,
              });
            }
          });
        });
      }
    );
  }

  function handleLogout() {
    logout();
    setShowUserMenu(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 relative">
      {/* Top Navbar */}
      <div className="bg-slate-50 shadow-md p-4 flex items-center justify-between gap-8 w-full sm:pl-72 pl-16">
        <div className="flex-1 relative" ref={searchRef}>
          <div className="relative">
            <AiOutlineSearch
              size={24}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border pl-16 pr-4 py-3 w-full focus:ring focus:ring-slate-500 text-lg rounded-lg outline outline-slate-200"
            />
            {searchTerm && (
              <RxCross2
                size={24}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => {
                  setSearchTerm("");
                }}
              />
            )}
          </div>
          {filteredFolders.length > 0 || filteredFiles.length > 0 ? (
            <div className="absolute left-0 right-0 border-2 border-gray-800 bg-slate-50 mt-2 rounded-lg max-h-1/2 shadow-lg z-10  overflow-y-auto">
              {filteredFolders.length > 0 && (
                <div className="border-b-2 border-gray-800 md:p-2 p-0">
                  <p className="text-gray-600 px-4  pt-2 font-semibold text-sm uppercase tracking-wide bg-gray-50">
                    Folders
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {filteredFolders.map((folder) => (
                      <div
                        key={folder.id}
                        className="md:px-4 px-0 py-2 hover:bg-gray-100 transition-colors duration-200 cursor-pointer  flex flex-wrap items-center"
                      >
                        <Folder folder={folder} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {filteredFiles.length > 0 && (
                <div className="md:p-2 p-0">
                  <p className="text-gray-600 px-4 pt-2 font-semibold text-sm uppercase tracking-wide bg-slate-50">
                    Files
                  </p>

                  <div className="flex flex-wrap gap-4">
                    {filteredFiles.map((file) => (
                      <div
                        key={file.id}
                        className="md:px-4 px-0 py-2 cursor-pointer flex flex-wrap items-center"
                      >
                        <File file={file} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
        <div className="relative flex items-center" ref={avatarRef}>
          <div
            className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="User Avatar"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-gray-600 text-xl">
                {user?.displayName?.[0] || "U"}
              </span>
            )}
          </div>
          {showUserMenu && (
            <div
              className="absolute right-4 top-4 mt-2 bg-white border rounded shadow-lg w-fit z-50"
              ref={userMenuRef}
            >
              <div className="p-4">
                <p className="font-semibold">{user?.displayName || "User"}</p>
                <p className="text-gray-600">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 bg-red-100 duration-200"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1">
        <Sidebar
          folder={folder}
          setIsModal={setIsModal}
          uploadFile={uploadFile}
          childFolders={childFolders}
          childFiles={childFiles}
        />

        <div className="flex-1 sm:ml-64 ml-2 p-6">
          <div className="flex justify-between items-center mb-6">
            <BreadCrumbs currentFolder={folder} />
          </div>

          {childFolders.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {childFolders.map((childFolder) => (
                <Folder key={childFolder.id} folder={childFolder} />
              ))}
            </div>
          )}

          {childFolders.length > 0 && childFiles.length > 0 && (
            <hr style={{ height: "12px", marginTop: "24px" }} />
          )}
          {childFiles.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-4">
              {childFiles.map((childFile) => (
                <File key={childFile.id} file={childFile} />
              ))}
            </div>
          )}
        </div>
      </div>

      {uploadFileState.name || uploadFileState.progress ? (
        <div className="p-4 bg-white shadow rounded-lg fixed bottom-4 left-1/2 transform -translate-x-1/2 w-11/12 max-w-lg">
          <div className="flex justify-between items-center mb-2">
            <h1 className="font-semibold">{uploadFileState.name}</h1>
            {uploadFileState.error ? (
              <button
                className="text-red-500"
                onClick={() =>
                  setUploadFileState({
                    name: null,
                    progress: null,
                    error: false,
                  })
                }
              >
                X
              </button>
            ) : null}
          </div>
          <div className="relative h-4 bg-gray-200 rounded">
            <div
              className={`absolute top-0 left-0 h-4 rounded ${
                uploadFileState.error ? "bg-red-500" : "bg-blue-500"
              }`}
              style={{ width: `${uploadFileState.progress}%` }}
            ></div>

            <span className="absolute top-0 left-1/2 transform -translate-x-1/2 text-sm">
              {!uploadFileState.error
                ? `${Math.round(uploadFileState.progress)}%`
                : "Error"}
            </span>
          </div>
        </div>
      ) : null}
      {isModal && <ModalFolder setIsModal={setIsModal} folder={folder} />}
    </div>
  );
}

export default Dashboard;
