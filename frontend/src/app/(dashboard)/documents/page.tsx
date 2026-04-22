"use client";
import { useEffect, useState } from "react";

interface DocumentPreviewModalProps {
  document: {
    FormName: string;
    FormType: string;
    FileUrl?: string;
  } | null;
  onClose: () => void;
}

function DocumentPreviewModal({ document, onClose }: DocumentPreviewModalProps) {
  if (!document) return null;

  const fileUrl = document.FileUrl || "#";
  const isPdf = document.FormType?.toLowerCase() === "pdf";
  const isDocx = document.FormType?.toLowerCase() === "dynamicdocx";

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl w-[700px] h-[500px] p-4 relative shadow-lg flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 hover:text-black text-xl font-medium z-10"
        >
          ✕
        </button>

        {/* Header */}
        <div className="border-b border-gray-200 pb-2 mb-2">
          <h3 className="text-lg font-semibold text-gray-900 pr-8">
            {document.FormName}
          </h3>
          <p className="text-xs text-gray-500">
            Type: {document.FormType}
          </p>
        </div>

        {/* Preview Content */}
        <div className="flex-1 bg-gray-50 rounded-lg overflow-hidden">
          {fileUrl && fileUrl !== "#" ? (
            isPdf ? (
              <iframe
                src={fileUrl}
                className="w-full h-full"
                title={`Preview of ${document.FormName}`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <p className="text-lg mb-2">📄 {document.FormName}</p>
                  <p className="text-sm">Preview not available for this file type</p>
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                  >
                    Open in new tab →
                  </a>
                </div>
              </div>
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">📄 {document.FormName}</p>
                <p className="text-sm">Document file not available</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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

function getDocumentCountText(count: number): string {
  return count === 1 ? "1 document" : `${count} documents`;
}

export default function DocumentsPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewDocument, setPreviewDocument] = useState<{
    FormName: string;
    FormType: string;
    FileUrl?: string;
  } | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  const toggleCard = (index: number) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

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

              {/* DOC COUNT & EXPAND BUTTON */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">
                  {getDocumentCountText(policy.Forms?.length || 0)}
                </span>
                <button
                  onClick={() => toggleCard(index)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  {expandedCards.has(index) ? (
                    <>Hide <span>▲</span></>
                  ) : (
                    <>View <span>▼</span></>
                  )}
                </button>
              </div>

              {/* DOCUMENT LIST - Collapsible */}
              {expandedCards.has(index) && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
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

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setPreviewDocument(form)}
                            className="text-xs text-gray-600 hover:text-gray-900 font-medium"
                          >
                            Preview
                          </button>
                          <a
                            href={form.FileUrl || "#"}
                            download
                            target="_blank"
                            className="text-xs text-blue-600 hover:underline font-medium"
                          >
                            Download
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-400">
                      No documents
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDocument && (
        <DocumentPreviewModal
          document={previewDocument}
          onClose={() => setPreviewDocument(null)}
        />
      )}
    </div>
  );
}