import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROOT_FOLDER } from "../hooks/useFolder";
import { AiOutlineArrowLeft } from "react-icons/ai";

function BreadCrumbs({ currentFolder }) {
  const navigate = useNavigate();
  let path = currentFolder === ROOT_FOLDER ? [] : [ROOT_FOLDER];

  if (currentFolder) path = [...path, ...currentFolder.path];

  return (
    <div className="flex items-center gap-[0.5rem] font-[1.15rem]">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="bg-gray-300 text-black p-2 rounded mr-4"
      >
        <AiOutlineArrowLeft />
      </button>

      {/* Breadcrumbs Path */}
      {path.map((folder) => (
        <div key={folder.id} className="flex items-center gap-[0.5rem]">
          <Link to={folder.id ? `/folder/${folder.id}` : "/"}>
            {folder.name}
          </Link>
          <span>/</span>
        </div>
      ))}
      {currentFolder && <span>{currentFolder.name}</span>}
    </div>
  );
}

export default BreadCrumbs;
