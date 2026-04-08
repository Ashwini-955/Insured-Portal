"use client";
import { useEffect, useState } from "react";

function getPolicyType(policy: any) {
  const coverages = policy.PolicyCoverages?.Coverages || [];

  if (
    coverages.some((c: any) =>
      c.Description?.toLowerCase().includes("farm")
    )
  ) {
    return "Farm Insurance";
  }

  if (
    coverages.some((c: any) =>
      c.Description?.toLowerCase().includes("dwelling")
    )
  ) {
    return "Home Insurance";
  }

  if (
    coverages.some((c: any) =>
      c.Description?.toLowerCase().includes("bodily injury")
    )
  ) {
    return "Auto Insurance";
  }

  return "General Policy";
}

export default function DocumentsPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/policies")
      .then((res) => res.json())
      .then((data) => {
        setPolicies(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* 🔥 HEADING */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
          Document Center
        </h1>
        <p className="text-sm text-gray-500">
          Manage and download your policy documents
        </p>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : policies.length === 0 ? (
        <div className="text-gray-400">No policies found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {policies.map((policy, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-gray-200 px-4 py-4 hover:shadow-md transition"
            >
              {/* HEADER */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-[11px] text-gray-400 tracking-wide">
                    POLICY
                  </div>
                  <div className="text-base font-semibold text-gray-900">
                    {policy.PolicyNumber}
                  </div>
                </div>

                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full ${
                    policy.PolicyStatus === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {policy.PolicyStatus}
                </span>
              </div>

              {/* TYPE */}
              <div className="text-sm font-medium text-gray-800 mb-1">
                {getPolicyType(policy)}
              </div>

              {/* DOC COUNT */}
              <div className="text-xs text-gray-500 mb-3">
                {policy.Forms?.length || 0} documents
              </div>

              {/* DOCUMENT LIST */}
              <div className="space-y-2">
                {policy.Forms?.length > 0 ? (
                  policy.Forms.map((form: any, i: number) => (
                    <div
                      key={i}
                      className="flex justify-between items-center text-sm text-gray-700"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">
                          {form.FormType === "DynamicDocx" ? "⚡" : "📄"}
                        </span>
                        <span className="truncate">
                          {form.FormName}
                        </span>
                      </div>

                      <a
                        href={form.FileUrl || "#"}
                        download
                        target="_blank"
                        className="text-xs text-blue-600 hover:underline font-medium"
                      >
                        Download
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-400">
                    No documents
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}