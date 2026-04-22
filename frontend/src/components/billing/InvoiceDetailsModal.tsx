"use client";

import { formatDate } from "@/utils/formatDate";
import { formatCurrency } from "@/utils/formatCurrency";

interface Props {
  invoice: any;
  onClose: () => void;
}

export default function InvoiceDetailsModal({ invoice, onClose }: Props) {
  if (!invoice) return null;

  const invoiceId = invoice.invoiceId || "-";

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl w-[600px] p-6 relative shadow-lg">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">Invoice Details</h2>

        <div className="space-y-3 text-sm">

          <p>
            <b>Invoice ID:</b> {invoiceId}
          </p>

          <p>
            <b>Issue Date:</b>{" "}
            {invoice.statementDate
              ? formatDate(invoice.statementDate)
              : "-"}
          </p>

          <p>
            <b>Due Date:</b>{" "}
            {formatDate(invoice.statementDueDate)}
          </p>

          <p>
            <b>Amount:</b>{" "}
            {formatCurrency(invoice.statementTotalAmountDue || 0)}
          </p>

          <p>
            <b>Status:</b>{" "}
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                invoice.status?.toLowerCase() === "paid"
                  ? "bg-green-100 text-green-600"
                  : invoice.status?.toLowerCase() === "due"
                  ? "bg-orange-100 text-orange-600"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {invoice.status}
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}