import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Download, ExternalLink } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';
import { formatCurrency } from '@/utils/formatCurrency';
import type { Billing } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Props {
  billing: Billing | null;
  onView: (invoice: any) => void;
}

export default function InvoiceHistoryTable({ billing, onView }: Props) {
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    setVisibleCount(5);
  }, [billing]);

  const handleDownloadAll = () => {
    if (!billing || !billing.projectedStatements) return;

    const doc = new jsPDF();
    const tableData = billing.projectedStatements.map((invoice, idx) => {
      const invoiceId = `INV-${new Date(invoice.statementDate || invoice.statementDueDate).getFullYear()}-${String(idx + 1).padStart(3, '0')}`;
      return [
        invoiceId,
        invoice.statementDate ? formatDate(invoice.statementDate) : '-',
        formatDate(invoice.statementDueDate),
        formatCurrency(invoice.statementTotalAmountDue || 0),
        invoice.status || 'Pending',
      ];
    });

    autoTable(doc, {
      head: [['Invoice ID', 'Issue Date', 'Due Date', 'Amount', 'Status']],
      body: tableData,
    });

    doc.save('invoices.pdf');
  };

  const getStatusBadge = (status: string) => {
    const statusColor: Record<string, string> = {
      'Paid': 'bg-green-100 text-green-700',
      'Pending': 'bg-yellow-100 text-yellow-700',
      'Overdue': 'bg-red-100 text-red-700',
    };

    const color = statusColor[status] || 'bg-gray-100 text-gray-700';
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-8">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900">Invoice History</h2>
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors shadow-sm w-fit" onClick={handleDownloadAll}>
          <Download className="w-4 h-4" />
          <span>Download All</span>
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f8fafc] text-gray-500 font-semibold border-b border-gray-200 text-xs">
            <tr>
              <th className="px-6 py-4 whitespace-nowrap">Invoice ID</th>
              <th className="px-6 py-4 whitespace-nowrap">Issue Date</th>
              <th className="px-6 py-4 whitespace-nowrap">Due Date</th>
              <th className="px-6 py-4 whitespace-nowrap text-center">Raise a Dispute</th>
              <th className="px-6 py-4 whitespace-nowrap text-right">Amount</th>
              <th className="px-6 py-4 whitespace-nowrap text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {billing.projectedStatements.slice(0, visibleCount).map((invoice, idx) => {
              // Creating a mock invoice ID for display since not immediately present in projectedStatements map
              const invoiceId = `INV-${new Date(invoice.statementDate || invoice.statementDueDate).getFullYear()}-${String(idx + 1).padStart(3, '0')}`;
              
              return (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap text-xs">
                    {invoiceId}
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium whitespace-nowrap">
                    {invoice.statementDate ? formatDate(invoice.statementDate) : '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium whitespace-nowrap">
                    {formatDate(invoice.statementDueDate)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link href={`/support?disputeInvoiceId=${invoiceId}`} className="text-gray-400 hover:text-red-500 transition-colors inline-block" title="Dispute this invoice">
                      <ExternalLink className="w-4 h-4 mx-auto" strokeWidth={2.5} />
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-800 whitespace-nowrap">
                    {formatCurrency(invoice.statementTotalAmountDue || 0)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(invoice.status)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Load More Footer */}
      <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50/50">
        {billing.projectedStatements.length > visibleCount && (
          <button
            onClick={() => setVisibleCount((prev) => prev + 5)}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold text-xs rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            Load More
          </button>
        )}
      </div>
    </div>
  );
}
