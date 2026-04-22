import React, { useState } from 'react';
import { CreditCard, CheckCircle2, AlertCircle, CalendarDays } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';
import type { Billing } from '@/types';

export default function AutoPayCard({ billing }: { billing: Billing | null }) {
  if (!billing) return null;

  // Local state to handle the toggle optimistic update visually
  const [isAutoPayEnabled, setIsAutoPayEnabled] = useState(!!billing.isRecurringPayment);
  const [autoPayDay, setAutoPayDay] = useState<string>('');

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

  const getDisplayDate = () => {
    if (!nextAttemptDate) return null;
    if (!autoPayDay) return formatDate(nextAttemptDate);
    
    // Create new date adjusted by the user's selected day
    const dateObj = new Date(nextAttemptDate);
    const day = parseInt(autoPayDay, 10);
    dateObj.setDate(day);
    return formatDate(dateObj.toISOString());
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm flex flex-col justify-between h-full">
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

        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          {isAutoPayEnabled 
            ? "Auto-Pay is enabled. Your payments will be automatically deducted on your selected due date. You will receive a notification 3 days prior."
            : "Auto-Pay is currently disabled. Enable to have payments automatically deducted from your primary payment method."}
        </p>

        {isAutoPayEnabled && (
          <div className="mb-6 bg-blue-50/50 rounded-lg p-4 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <CalendarDays className="w-4 h-4 text-blue-600" />
              Preferred Deduction Date
            </div>
            <select
              value={autoPayDay}
              onChange={(e) => setAutoPayDay(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-auto p-2"
            >
              <option value="">Default (Due Date)</option>
              {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                <option key={day} value={day}>{day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of month</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="space-y-3 text-sm border-t border-gray-100 pt-6 mt-6">
        <div className="flex items-center justify-between text-gray-700">
          <div className="flex items-center gap-2">
            {isAutoPayEnabled ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
               <AlertCircle className="w-4 h-4 text-gray-400" />
            )}
            <span className="font-semibold text-gray-500">Status:</span>
          </div>
          <span className={`font-medium ${isAutoPayEnabled ? 'text-gray-900' : 'text-gray-500'}`}>
            {isAutoPayEnabled ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="flex items-center justify-between text-gray-700">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-400" />
            <span className="font-semibold text-gray-500">Next attempt:</span>
          </div>
          <span className="font-bold text-gray-900">{getDisplayDate() || 'TBD'}</span>
        </div>
      </div>
    </div>
  );
}
