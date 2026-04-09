"use client";
import React from "react";
import { Calendar, User } from "lucide-react";
import type { Policy } from "@/types";

interface Props {
  policy: Policy | null;
  user?: any; // 👈 pass user from parent
}

export default function SelectedPolicySummary({ policy, user }: Props) {
  if (!policy) return null;

  // 🔹 Helper to capitalize
  const formatName = (name: string) =>
    name.charAt(0).toUpperCase() + name.slice(1);

  // 🔹 Smart fallback logic
  const accountHolder =
    user?.email
      ? formatName(user.email.split("@")[0])
      : "User";

  return (
    <div className="bg-[#f8fafc] border border-gray-200 rounded-xl p-5 mb-6 flex items-center justify-between shadow-sm animate-in fade-in duration-300">
      
      <div className="flex items-center space-x-4">
        
        {/* Icon */}
        <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-700"
          >
            <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="m3 15 2 2 4-4" />
          </svg>
        </div>

        {/* Content */}
        <div>
          <h3 className="font-bold text-gray-900 text-lg">
            {policy.policyType || "Insurance Policy"}
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 gap-1 sm:gap-3 mt-1">
            
            {/* Policy Number */}
            <span className="font-medium text-gray-700">
              Policy No. {policy.policyNumber}
            </span>

            <span className="hidden sm:inline text-gray-300">|</span>

            {/* Account Holder */}
            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              <span>
                Account Holder:{" "}
                <span className="text-gray-800 font-medium">
                  {accountHolder}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600 font-medium bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
        <Calendar className="w-4 h-4 text-gray-400" />
        <span>
          Active since{" "}
          {policy.effectiveDate
            ? new Date(policy.effectiveDate).toLocaleDateString()
            : "Jan 1, 2024"}
        </span>
      </div>
    </div>
  );
}