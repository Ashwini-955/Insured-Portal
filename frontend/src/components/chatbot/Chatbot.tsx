// "use client";
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bot, ChevronRight, MessageCircle, Send, User, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getBillingByPolicyNumbers,
  getClaimsByPolicyNumbers,
  getPoliciesByEmail,
} from "@/lib/api";
import type { Billing, Claim, Policy } from "@/types";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Sender = "bot" | "user";
type ChatCategory = "policies" | "claims" | "billing" | "others";
type Intent =
  | "policy_count"
  | "active_policies"
  | "expired_policies"
  | "policy_details"
  | "pending_claims"
  | "active_claims"
  | "approved_claims"
  | "rejected_claims"
  | "pending_payments"
  | "next_payment_due"
  | "payment_history";

type QuickOption = {
  label: string;
  intent?: Intent; // undefined for "Ask something else"
};

// ---------------------------------------------------------------------------
// Predefined quick options per category
// ---------------------------------------------------------------------------
const categoryOptions: Record<ChatCategory, QuickOption[]> = {
  policies: [
    { label: "How many policies do I have?", intent: "policy_count" },
    { label: "Which policies are active?", intent: "active_policies" },
    { label: "Which policies are expired?", intent: "expired_policies" },
    { label: "Show my policy details", intent: "policy_details" },
    { label: "Ask something else" },
  ],
  claims: [
    { label: "Which claims are pending?", intent: "pending_claims" },
    { label: "Which claims are active?", intent: "active_claims" },
    { label: "Which claims are approved?", intent: "approved_claims" },
    { label: "Which claims are rejected?", intent: "rejected_claims" },
    { label: "Ask something else" },
  ],
  billing: [
    { label: "Is any payment pending?", intent: "pending_payments" },
    { label: "What is my next payment due?", intent: "next_payment_due" },
    { label: "Show my payment history", intent: "payment_history" },
    { label: "Ask something else" },
  ],
  others: [], // No quick options, free‑form only
};

// ---------------------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------------------
const createMessage = (sender: Sender, text: string): ChatMessage => ({
  id: `${sender}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  sender,
  text,
  timestamp: new Date(),
});

type ChatMessage = {
  id: string;
  sender: Sender;
  text: string;
  timestamp: Date;
};

const normalize = (value?: string | null) => (value || "").trim().toLowerCase();

const isPolicyActive = (policy: Policy) => {
  const status = normalize(policy.status);
  if (status.includes("active")) return true;
  if (!policy.expirationDate) return false;
  const expirationDate = new Date(policy.expirationDate);
  return !Number.isNaN(expirationDate.getTime()) && expirationDate >= new Date();
};

const isPolicyExpired = (policy: Policy) => {
  const status = normalize(policy.status);
  if (status.includes("expired") || status.includes("cancel")) return true;
  if (!policy.expirationDate) return false;
  const expirationDate = new Date(policy.expirationDate);
  return !Number.isNaN(expirationDate.getTime()) && expirationDate < new Date();
};

const getClaimMatches = (claims: Claim[], keyword: string) =>
  claims.filter((claim) => normalize(claim.Status).includes(keyword));

const listLines = (items: string[], emptyText: string) =>
  items.length > 0 ? items.map((item, idx) => `${idx + 1}. ${item}`).join("\n") : emptyText;

// ---------------------------------------------------------------------------
// Chatbot component
// ---------------------------------------------------------------------------
export function Chatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ChatCategory | null>(null);
  const [customModeCategory, setCustomModeCategory] = useState<ChatCategory | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([createMessage("bot", "Hi, I am your assistant. Choose a topic or type your question.")]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [billing, setBilling] = useState<Billing[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const loadedForEmailRef = useRef<string | null>(null);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load user data when chatbot opens
  useEffect(() => {
    if (!isOpen || !user?.email || loadedForEmailRef.current === user.email) return;
    const controller = new AbortController();
    const userEmail = user.email;
    async function loadChatbotData() {
      setIsLoadingData(true);
      setDataError(null);
      try {
        const userPolicies = await getPoliciesByEmail(userEmail, controller.signal);
        const numbers = userPolicies.map((p) => p.policyNumber).filter(Boolean);
        const [userClaims, userBilling] = await Promise.all([
          getClaimsByPolicyNumbers(numbers, controller.signal),
          getBillingByPolicyNumbers(numbers, controller.signal),
        ]);
        setPolicies(userPolicies);
        setClaims(userClaims);
        setBilling(userBilling);
        loadedForEmailRef.current = userEmail;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        setDataError(error instanceof Error ? error.message : "Unable to load account details.");
      } finally {
        setIsLoadingData(false);
      }
    }
    loadChatbotData();
    return () => controller.abort();
  }, [isOpen, user?.email]);

  // -----------------------------------------------------------------------
  // Rule‑based answer generation (same logic as before)
  // -----------------------------------------------------------------------
  const getIntentAnswer = useCallback(
    (intent: Intent) => {
      if (isLoadingData) return "I am loading your account details. Please try again in a moment.";
      if (dataError) return `I could not load your account details right now. ${dataError}`;

      const activePolicies = policies.filter(isPolicyActive);
      const expiredPolicies = policies.filter(isPolicyExpired);
      const pendingClaims = getClaimMatches(claims, "pending");
      const activeClaims = getClaimMatches(claims, "active");
      const approvedClaims = getClaimMatches(claims, "approved");
      const rejectedClaims = getClaimMatches(claims, "rejected");
      const dueBills = billing.filter((b) => Number(b.currentAmountDue || 0) > 0);

      switch (intent) {
        case "policy_count":
          return `You have ${policies.length} polic${policies.length === 1 ? "y" : "ies"}. ${activePolicies.length} active, ${expiredPolicies.length} expired.`;
        case "active_policies":
          return listLines(
            activePolicies.map((p) => `${p.policyNumber} - ${p.policyType || "Insurance"} - expires ${formatDate(p.expirationDate)}`),
            "You do not have any active policies right now."
          );
        case "expired_policies":
          return listLines(
            expiredPolicies.map((p) => `${p.policyNumber} - ${p.policyType || "Insurance"} - expired ${formatDate(p.expirationDate)}`),
            "You do not have any expired policies right now."
          );
        case "policy_details":
          return listLines(
            policies.map((p) => `${p.policyNumber} - ${p.policyType || "Insurance"} - ${p.status || "Active"} - ${formatDate(p.effectiveDate)} to ${formatDate(p.expirationDate)}`),
            "I could not find any policies for your account."
          );
        case "pending_claims":
          return listLines(
            pendingClaims.map((c) => `${c.ClaimNumber} - ${c.DescriptionOfLoss || "Claim"} - received ${formatDate(c.ReceivedDate)}`),
            "You do not have any pending claims right now."
          );
        case "active_claims":
          return listLines(
            activeClaims.map((c) => `${c.ClaimNumber} - ${c.DescriptionOfLoss || "Claim"} - loss date ${formatDate(c.LossDate)}`),
            "You do not have any active claims right now."
          );
        case "approved_claims":
          return listLines(
            approvedClaims.map((c) => `${c.ClaimNumber} - ${c.DescriptionOfLoss || "Claim"} - paid ${formatCurrency(Number(c.PaidLoss || 0))}`),
            "You do not have any approved claims right now."
          );
        case "rejected_claims":
          return listLines(
            rejectedClaims.map((c) => `${c.ClaimNumber} - ${c.DescriptionOfLoss || "Claim"} - policy ${c.PolicyNumber}`),
            "You do not have any rejected claims right now."
          );
        case "pending_payments":
          return listLines(
            dueBills.map((b) => `${b.PolicyNumber} - ${formatCurrency(Number(b.currentAmountDue || 0))} due ${formatDate(b.currentDueDate)}`),
            "You do not have any pending payments right now."
          );
        case "next_payment_due": {
          const nextBill = dueBills
            .filter((b) => b.currentDueDate)
            .sort((a, b) => new Date(a.currentDueDate || "").getTime() - new Date(b.currentDueDate || "").getTime())[0];
          if (!nextBill) return "I could not find an upcoming payment due for your policies.";
          return `Your next payment is ${formatCurrency(Number(nextBill.currentAmountDue || 0))} for policy ${nextBill.PolicyNumber}, due on ${formatDate(nextBill.currentDueDate)}.`;
        }
        case "payment_history": {
          const statements = billing
            .flatMap((b) =>
              (b.projectedStatements || []).map((s) => ({
                ...s,
                policy: s.policy || b.PolicyNumber,
              }))
            )
            .filter((s) => normalize(s.status).includes("paid"))
            .sort((a, b) => new Date(b.statementDueDate || "").getTime() - new Date(a.statementDueDate || "").getTime())
            .slice(0, 4);
          return listLines(
            statements.map((s) => `${s.policy} - ${formatCurrency(Number(s.statementTotalAmountDue || 0))} paid for ${formatDate(s.statementDueDate)}`),
            "I could not find recent paid statements for your account."
          );
        }
        default:
          return "I couldn't find an answer for that.";
      }
    },
    [billing, claims, dataError, isLoadingData, policies]
  );

  // -----------------------------------------------------------------------
  // Intent detection (used only for free‑form when not in custom mode)
  // -----------------------------------------------------------------------
  const detectIntent = (msg: string): Intent | null => {
    const text = normalize(msg);
    if (text.includes("cover") || text.includes("covered") || text.includes("coverage")) return null;
    if (text.includes("how many") && text.includes("polic")) return "policy_count";
    if (text.includes("active") && text.includes("polic")) return "active_policies";
    if ((text.includes("expired") || text.includes("cancel")) && text.includes("polic")) return "expired_policies";
    if (text.includes("policy details") || text.includes("show my policy") || text.includes("show my policies") || text.includes("my policies")) return "policy_details";
    if (text.includes("pending") && text.includes("claim")) return "pending_claims";
    if (text.includes("active") && text.includes("claim")) return "active_claims";
    if (text.includes("approved") && text.includes("claim")) return "approved_claims";
    if (text.includes("rejected") && text.includes("claim")) return "rejected_claims";
    if ((text.includes("pending") || text.includes("due")) && text.includes("payment")) return "pending_payments";
    if (text.includes("next") && (text.includes("payment") || text.includes("premium"))) return "next_payment_due";
    if (text.includes("history") && text.includes("payment")) return "payment_history";
    return null;
  };

  // -----------------------------------------------------------------------
  // Messaging helpers
  // -----------------------------------------------------------------------
  const sendBotResponse = useCallback((answer: string) => {
    window.setTimeout(() => {
      setMessages((cur) => [...cur, createMessage("bot", answer)]);
    }, 250);
  }, []);

  const getRagAnswer = async (msg: string, category: ChatCategory) => {
    const response = await fetch("http://localhost:5000/api/chat/rag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg, email: user?.email, category }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.message || err?.error || `Request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.answer || "I could not generate an answer.";
  };

  const handleCategoryClick = (cat: ChatCategory) => {
    setSelectedCategory(cat);
    setCustomModeCategory(null);
    setMessages([createMessage("bot", `You selected ${cat}. Choose a question or type your own.`)]);
  };

  const handleQuickOptionClick = (option: QuickOption) => {
    setMessages((cur) => [...cur, createMessage("user", option.label)]);
    if (!option.intent) {
      // "Ask something else"
      if (selectedCategory) {
        setCustomModeCategory(selectedCategory);
        sendBotResponse(`Sure, ask your custom question about ${selectedCategory}.`);
      }
      return;
    }
    const answer = getIntentAnswer(option.intent);
    sendBotResponse(answer);
  };

  const handleSendMessage = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isSending) return;
    if (!user?.email) {
      setMessages((c) => [...c, createMessage("bot", "Please log in first so I can answer using your account details.")]);
      return;
    }
    const currentCat = customModeCategory ?? selectedCategory ?? "others";
    setInputValue("");
    setMessages((c) => [...c, createMessage("user", trimmed)]);

    // Custom mode always goes to RAG
    if (customModeCategory) {
      try {
        setIsSending(true);
        setMessages((c) => [...c, createMessage("bot", "Thinking...")]);
        const ragAns = await getRagAnswer(trimmed, currentCat);
        setMessages((c) => [...c.slice(0, -1), createMessage("bot", ragAns)]);
      } catch (err) {
        console.error("Chatbot frontend error:", err);
        const friendly = err instanceof Error ? err.message : "Something went wrong. Please try again in a moment.";
        setMessages((c) => [...c.slice(0, -1), createMessage("bot", friendly)]);
      } finally {
        setIsSending(false);
        setCustomModeCategory(null);
      }
      return;
    }

    const intent = detectIntent(trimmed);
    if (intent) {
      sendBotResponse(getIntentAnswer(intent));
      return;
    }

    try {
      setIsSending(true);
      setMessages((c) => [...c, createMessage("bot", "Thinking...")]);
      const ragAns = await getRagAnswer(trimmed, currentCat);
      setMessages((c) => [...c.slice(0, -1), createMessage("bot", ragAns)]);
    } catch (err) {
      console.error("Chatbot frontend error:", err);
      const friendly = err instanceof Error ? err.message : "Something went wrong. Please try again in a moment.";
      setMessages((c) => [...c.slice(0, -1), createMessage("bot", friendly)]);
    } finally {
      setIsSending(false);
    }
  };

  // -----------------------------------------------------------------------
  // Render UI
  // -----------------------------------------------------------------------
  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {isOpen && (
        <section
          className="mb-4 flex h-[500px] max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 transition-all duration-300 sm:w-[350px]"
          aria-label="Assistant chatbot"
        >
          <header className="flex items-center gap-3 bg-slate-950 px-4 py-3 text-white">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
              <Bot className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-semibold">Assistant</h2>
              <p className="truncate text-xs text-slate-300">How can I help you?</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Close chatbot"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </header>

          {/* Category selector */}
          {!selectedCategory && (
            <div className="border-b border-slate-100 bg-white px-4 py-3">
              <p className="mb-2 text-sm font-medium text-slate-800">Select a category:</p>
              <div className="flex flex-wrap gap-2">
                {(["policies", "claims", "billing", "others"] as ChatCategory[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryClick(cat)}
                    className="rounded-full border px-3 py-2 text-xs font-medium transition border-slate-300 bg-slate-50 text-slate-700 hover:bg-blue-50 hover:border-blue-200"
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick options for chosen category */}
          {selectedCategory && (
            <>
              <div className="border-b border-slate-100 bg-white px-4 py-3">
                {selectedCategory === "others" ? (
                  <p className="text-sm text-slate-800">Ask me anything about your policies, claims, or billing.</p>
                ) : (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {categoryOptions[selectedCategory].map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => handleQuickOptionClick(opt)}
                        className={`shrink-0 rounded-full border px-3 py-2 text-xs font-medium transition ${opt.intent ? "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50" : "border-blue-600 bg-blue-600 text-white"}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
                {messages.map((msg) => {
                  const isUser = msg.sender === "user";
                  return (
                    <div key={msg.id} className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
                      {!isUser && (
                        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700">
                          <Bot className="h-4 w-4" aria-hidden="true" />
                        </div>
                      )}
                      <div className={`max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
                        <div
                          className={`whitespace-pre-line rounded-2xl px-3 py-2 text-sm leading-5 ${isUser ? "rounded-br-md bg-blue-600 text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-800"}`}
                        >
                          {msg.text}
                        </div>
                        <p className={`mt-1 text-[10px] text-slate-400 ${isUser ? "text-right" : "text-left"}`}>
                          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      {isUser && (
                        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                          <User className="h-4 w-4" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form
                className="flex items-center gap-2 border-t border-slate-200 bg-white p-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
              >
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Type your question..."
                  aria-label="Type your question"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isSending}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>
            </>
          )}
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((c) => !c)}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl shadow-blue-600/30 transition duration-300 hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
        aria-label={isOpen ? "Hide assistant" : "Open assistant"}
      >
        {isOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <MessageCircle className="h-6 w-6" aria-hidden="true" />}
      </button>
    </div>
  );
}