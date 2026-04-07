"use client";
import { useEffect, useState } from "react";
import Folder from "@/components/documents/folder";

export default function DocumentsPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/policies")
      .then((res) => res.json())
      .then((data) => {
        console.log("API DATA:", data);
        setPolicies(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Document Center</h1>

      {/* Policies */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Policies</h2>

        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : policies.length === 0 ? (
          <div className="text-gray-400">No policies found</div>
        ) : (
          policies.map((policy, index) => (
            <Folder key={index} name={policy.PolicyNumber}>
              
              {/* Status */}
              <div className="text-xs text-gray-500 mb-1">
                Status: {policy.PolicyStatus}
              </div>

              <span
                className={`text-xs px-2 py-1 rounded ml-2 ${
                policy.PolicyStatus === "Active"
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
              }`}
>
  {policy.PolicyStatus}
</span>

              {/* Forms */}
              {policy.Forms && policy.Forms.length > 0 ? (
                policy.Forms.map((form: any, i: number) => (
                  <div key={i} className="text-sm">
                    {form.FormType === "DynamicDocx" ? "⚡" : "📄"}{" "}
                    {form.FormName}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-400">
                  No documents available
                </div>
              )}

            </Folder>
          ))
        )}
      </div>
    </div>
  );
}