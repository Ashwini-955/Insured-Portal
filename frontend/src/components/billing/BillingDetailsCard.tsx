import React, { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { useAuth } from '@/context/AuthContext';
import { sendPaymentEmail } from '@/lib/api';
import type { Billing } from '@/types';

export default function BillingDetailsCard({ billing }: { billing: Billing | null }) {
  const { user } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [lastEmailSent, setLastEmailSent] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('lastPaymentEmail');
    if (stored) {
      const data = JSON.parse(stored);
      if (data.policyNumber === billing?.PolicyNumber) {
        setLastEmailSent(data.timestamp);
      }
    }
  }, [billing?.PolicyNumber]);

  if (!billing) return null;

  // Assuming currentAmountDue is the total remaining if accountTotalBalance is missing.
  // The mockup shows total due and next payment.
  const totalDue = billing.accountTotalBalance || billing.currentAmountDue || 0;
  
  // Find next payment from projected statements
  let nextPaymentAmount = billing.currentAmountDue || 0;
  let nextPaymentDate = billing.currentDueDate || '';

  if (billing.projectedStatements && billing.projectedStatements.length > 0) {
    // Find the first future or due statement
    const nextStatement = billing.projectedStatements.find(
      (s) => s.status.toLowerCase() === 'future' || s.status.toLowerCase() === 'due'
    );
    if (nextStatement) {
      if (nextStatement.statementTotalAmountDue !== undefined) {
        nextPaymentAmount = nextStatement.statementTotalAmountDue;
      }
      nextPaymentDate = nextStatement.statementDueDate;
    }
  }

  const handlePayNow = async () => {
    if (!user?.email || !billing) return;

    setIsSending(true);
    try {
      await sendPaymentEmail({
        policyNumber: billing.PolicyNumber,
        email: user.email,
        amount: nextPaymentAmount,
      });
      const timestamp = new Date().toISOString();
      localStorage.setItem('lastPaymentEmail', JSON.stringify({ policyNumber: billing.PolicyNumber, timestamp }));
      window.dispatchEvent(new Event('notification-updated'));
      setLastEmailSent(timestamp);
      alert('Payment email sent successfully!');
    } catch (error) {
      alert(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border-2 border-orange-400 p-8 shadow-sm flex flex-col justify-center items-center text-center">
      <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mb-4">
        <span className="text-orange-500 font-bold text-xl">$</span>
      </div>
      <h2 className="text-4xl font-extrabold text-gray-900 mb-2">{formatCurrency(totalDue)}</h2>
      <p className="text-sm text-gray-500 font-medium mb-6">Total Due for Policy {billing.PolicyNumber}</p>
      
      <div className="font-semibold text-gray-800 mb-6">
        Next payment {formatCurrency(nextPaymentAmount)} due:{' '}
        <span className="text-blue-600">{formatDate(nextPaymentDate)}</span>
      </div>

      <button 
        className="bg-[#2563eb] hover:bg-blue-700 text-white w-full max-w-xs py-3 rounded-lg font-bold shadow-sm transition-all focus:ring-4 focus:ring-blue-100 flex justify-center items-center gap-2 disabled:opacity-50"
        onClick={handlePayNow}
        disabled={isSending}
      >
        <span>{isSending ? 'Sending...' : 'Pay Now'}</span>
        <CreditCard className="w-4 h-4" />
      </button>

      {lastEmailSent && (
        <p className="text-sm text-gray-500 mt-2">
          Last email sent: {formatDate(lastEmailSent)}
        </p>
      )}
    </div>
  );
}
