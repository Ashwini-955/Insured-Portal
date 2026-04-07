"use client";
import { useState } from "react";

interface FolderProps {
  name: string;
  children?: React.ReactNode;
}

export default function Folder({ name, children }: FolderProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-2">
      <div
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center cursor-pointer p-2 rounded-lg hover:bg-gray-100"
      >
        <span>📁 {name}</span>
        <span>{open ? "-" : "+"}</span>
      </div>

      {open && <div className="ml-6 mt-2">{children}</div>}
    </div>
  );
}