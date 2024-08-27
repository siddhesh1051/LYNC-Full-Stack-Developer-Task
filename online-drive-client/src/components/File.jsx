import React, { useState, useRef, useEffect } from "react";
import { AiFillFile } from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase"; // Adjust the path according to your structure

function File({ file }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const menuRef = useRef(null);

  const isImage = file.name.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i);

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

  // Function to handle file deletion
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      await deleteDoc(doc(db, "files", file.id)); // Adjust the path based on your structure
      closeMenu();
    }
  };

  // Function to handle file renaming
  const handleRename = async () => {
    if (newName.trim() !== "") {
      await updateDoc(doc(db, "files", file.id), { name: newName }); // Adjust the path based on your structure
      setIsRenaming(false);
      closeMenu();
    }
  };

  const handleDoubleClick = () => {
    window.open(file.url, "_blank", "noopener,noreferrer");
  };

  // Function to handle file download
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name;
    link.click();
  };

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="relative bg-white shadow-md rounded-lg p-4 sm:w-64 sm:h-64 w-52 h-52 flex flex-col items-center gap-2 cursor-pointer"
    >
      <button
        onClick={toggleMenu}
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
      >
        <BsThreeDotsVertical fontSize="1.25rem" />
      </button>

      {isImage ? (
        <img
          src={file.url}
          alt={file.name}
          className="w-full sm:h-44 h-32 object-cover rounded-md"
        />
      ) : (
        <div className="flex justify-center items-center w-full h-44 bg-gray-100 rounded-md">
          <AiFillFile fontSize="3rem" className="text-gray-500" />
        </div>
      )}

      <a
        href={file.url}
        target="_blank"
        rel="noreferrer"
        className="text-center font-semibold text-gray-800 mt-2 truncate max-w-36"
      >
        {file.name}
      </a>

      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-10 mt-2 w-48 bg-slate-50 rounded-md shadow-lg py-2 z-20"
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

export default File;
