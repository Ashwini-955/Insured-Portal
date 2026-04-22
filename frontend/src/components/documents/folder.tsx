"use client";
import { useState } from "react";

interface FolderProps {
  name: string;
  policyNumber?: string;
  children?: React.ReactNode;
}

export default function Folder({ name, policyNumber, children }: FolderProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center cursor-pointer p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
      >
        <div className="flex flex-col">
          <span className="font-semibold">📁 {name}</span>
          {policyNumber && (
            <span className="text-xs text-gray-500">
              {policyNumber}
            </span>
          )}
        </div>

        <span className="text-lg">{open ? "−" : "+"}</span>
      </div>

      {open && (
        <div className="mt-3 ml-2 border-l-2 border-gray-200 pl-4">
          {children}
        </div>
      )}
    </div>
  );
}