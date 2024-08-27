import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiFillFolder } from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";
import {
  doc,
  deleteDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase"; // Adjust the path according to your structure
import JSZip from "jszip";
import { saveAs } from "file-saver"; // Add this to handle the file saving

function Folder({ folder }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const menuRef = useRef(null);

  const navigate = useNavigate();

  // Function to toggle the menu open/close
  const toggleMenu = (e) => {
    e.preventDefault();
    setIsMenuOpen(!isMenuOpen);
  };

  // Function to close the menu
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Close the menu if clicking outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeMenu();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Function to handle folder deletion
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this folder?")) {
      await deleteDoc(doc(db, "folders", folder.id));
      closeMenu();
    }
  };

  // Function to handle folder renaming
  const handleRename = async () => {
    if (newName.trim() !== "") {
      await updateDoc(doc(db, "folders", folder.id), { name: newName });
      setIsRenaming(false);
      closeMenu();
    }
  };

  // Function to download the folder content as a zip file
  const handleDownload = async () => {
    const zip = new JSZip();
    const folderRef = collection(db, "folders", folder.id, "files");
    const querySnapshot = await getDocs(folderRef);

    for (const doc of querySnapshot.docs) {
      const file = doc.data();
      const response = await fetch(file.url);
      const blob = await response.blob();
      zip.file(file.name, blob);
    }

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, `${folder.name}.zip`);
    });
  };

  const handleDoubleClick = () => {
    navigate("/folder/" + folder.id);
  };

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="relative group bg-white shadow-md rounded-lg p-4 cursor-pointer"
    >
      <div className="flex items-center space-x-4 select-none">
        <AiFillFolder fontSize="2rem" className="text-yellow-500" />
        <span className="font-semibold text-gray-800">{folder.name}</span>
        <button
          onClick={toggleMenu}
          className="text-gray-600 hover:text-gray-900"
        >
          <BsThreeDotsVertical fontSize="1.25rem" />
        </button>
      </div>

      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-48 bg-slate-50 rounded-md shadow-lg py-2 z-20"
        >
          {!isRenaming ? (
            <>
              <button
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setIsRenaming(true);
                }}
              >
                Rename
              </button>
              <button
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
                onClick={handleDelete}
              >
                Delete
              </button>
              <button
                className="w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-100"
                onClick={handleDownload}
              >
                Download
              </button>
            </>
          ) : (
            <div className="p-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-2 py-1 border rounded mb-2"
              />
              <button
                onClick={handleRename}
                className="w-full text-left px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={() => setIsRenaming(false)}
                className="w-full text-left px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 mt-2"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Folder;
