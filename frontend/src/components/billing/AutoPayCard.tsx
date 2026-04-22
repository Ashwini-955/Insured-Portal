import React, { useState } from 'react';
import { CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';
import type { Billing } from '@/types';

export default function AutoPayCard({ billing }: { billing: Billing | null }) {
  if (!billing) return null;

  // Local state to handle the toggle optimistic update visually
  const [isAutoPayEnabled, setIsAutoPayEnabled] = useState(!!billing.isRecurringPayment);

  // Find next auto-pay attempt
  let nextAttemptDate = billing.currentDueDate || '';
  if (billing.projectedStatements && billing.projectedStatements.length > 0) {
    const nextStatement = billing.projectedStatements.find(
      (s) => s.status.toLowerCase() === 'future' || s.status.toLowerCase() === 'due'
    );
    if (nextStatement) {
      nextAttemptDate = nextStatement.statementDueDate;
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-900 text-lg">Auto-Pay for Policy {billing.PolicyNumber}</h3>
          </div>
          
          {/* Toggle Switch */}
          <button 
            type="button" 
            role="switch" 
            aria-checked={isAutoPayEnabled}
            onClick={() => setIsAutoPayEnabled(!isAutoPayEnabled)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${isAutoPayEnabled ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <span className="sr-only">Use setting</span>
            <span 
              aria-hidden="true" 
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isAutoPayEnabled ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed mb-8">
          {isAutoPayEnabled 
            ? "Auto-Pay is enabled. Your payments will be automatically deducted on the due date. You will receive a notification 3 days prior."
            : "Auto-Pay is currently disabled. Enable to have payments automatically deducted from your primary payment method."}
        </p>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-700">
          {isAutoPayEnabled ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
             <AlertCircle className="w-4 h-4 text-gray-400" />
          )}
          <span className="font-semibold text-gray-500">Status:</span>
          <span className={`font-medium ${isAutoPayEnabled ? 'text-gray-900' : 'text-gray-500'}`}>
            {isAutoPayEnabled ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <CreditCard className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-gray-500">Next Auto-Pay attempt:</span>
          <span className="font-bold text-gray-900">{formatDate(nextAttemptDate)}</span>
        </div>
      </div>
    </div>
  );
}
