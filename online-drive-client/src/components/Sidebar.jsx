import React, { useState } from "react";
import { HiFolderAdd, HiUpload } from "react-icons/hi";
import { AiFillFolder, AiFillFile } from "react-icons/ai";
import { Link } from "react-router-dom";
import { HiMenu } from "react-icons/hi";
import { RxCross2 } from "react-icons/rx";
import Logo from "./Logo";

function Sidebar({ folder, setIsModal, uploadFile, childFolders, childFiles }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="sm:hidden fixed top-0 left-0 p-4 z-50">
        <button onClick={toggleSidebar} className="text-black">
          {isOpen ? <RxCross2 size={24} /> : <HiMenu size={24} />}
        </button>
      </div>

      <div
        className={`fixed top-0 left-0 h-full sm:w-64 w-64 bg-slate-50 text-black shadow-lg flex flex-col items-center p-4 overflow-auto z-40 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0 transition-transform duration-300`}
      >
        <Link to="/" className="text-black no-underline">
          <div className="mb-8 mt-2">
            <Logo />
          </div>
        </Link>
        <div className="flex flex-col space-y-4 w-full">
          {/* Create Folder */}
          <button
            onClick={() => setIsModal(true)}
            className="flex items-center space-x-2 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <HiFolderAdd size={20} />
            <span>Create Folder</span>
          </button>
          {/* Upload File */}
          <label className="flex items-center space-x-2 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 cursor-pointer">
            <HiUpload size={20} />
            <span>Upload File</span>
            <input type="file" onChange={uploadFile} className="hidden" />
          </label>
        </div>

        {/* Folders */}
        {childFolders.length > 0 && (
          <div className="w-full mt-6">
            <h3 className="text-lg font-semibold mb-4">Folders</h3>
            <div className="flex flex-col space-y-2">
              {childFolders.map((childFolder) => (
                <Link
                  key={childFolder.id}
                  to={`/folder/${childFolder.id}`}
                  className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-200 rounded-lg"
                >
                  <AiFillFolder size={20} />
                  <span>{childFolder.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Files */}
        {childFiles.length > 0 && (
          <div className="w-full mt-6">
            <h3 className="text-lg font-semibold mb-4">Files</h3>
            <div className="flex flex-col space-y-2">
              {childFiles.map((childFile) => (
                <Link
                  key={childFile.id}
                  to={`/file/${childFile.id}`}
                  className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-200 rounded-lg"
                >
                  <AiFillFile size={20} />
                  <span>{childFile.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Sidebar;
