import React, { useState } from "react";
import { addFolder } from "../firebase";
import { ROOT_FOLDER } from "../hooks/useFolder";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

function ModalFolder({ isModal, setIsModal, folder }) {
  const [user] = useAuthState(auth);
  const [folderName, setFolderName] = useState("");

  function addFolderLocal() {
    if (folderName.trim() === "") {
      alert("Please fill in the folder name!");
      return;
    }

    const path = [...folder.path];
    if (folder !== ROOT_FOLDER) {
      path.push({ name: folder.name, id: folder.id });
    }
    addFolder(folderName, user.uid, folder, path);
    setFolderName("");
    setIsModal(false);
  }

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-start md:items-center z-50">
      <div className="bg-white p-6 m-6 rounded shadow-lg sm:w-1/3 w-full">
        <h2 className="text-lg font-semibold mb-4">Add Folder</h2>
        <input
          type="text"
          onChange={(e) => setFolderName(e.target.value)}
          value={folderName}
          placeholder="Enter Folder Name"
          className="border p-2 w-full mb-4"
        />
        <div className="flex justify-end gap-2">
          <button
            className="bg-gray-300 text-black py-2 px-4 rounded"
            onClick={() => setIsModal(false)}
          >
            Close
          </button>
          <button
            className="bg-green-500 text-white py-2 px-4 rounded"
            onClick={addFolderLocal}
          >
            Add Folder
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalFolder;
