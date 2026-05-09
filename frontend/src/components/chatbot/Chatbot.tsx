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

type Sender = "bot" | "user";
type CategoryKey = "policies" | "claims" | "payments";
type Intent =
  | "greeting"
  | "help"
  | "account_summary"
  | "policy_count"
  | "active_policies"
  | "expired_policies"
  | "policy_details"
  | "coverage_details"
  | "agent_details"
  | "property_address"
  | "billing_summary"
  | "pending_claims"
  | "active_claims"
  | "approved_claims"
  | "rejected_claims"
  | "claim_details"
  | "pending_payments"
  | "next_payment_due"
  | "payment_history"
  | "recurring_payment";

interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
  timestamp: Date;
}

interface QuickOption {
  label: string;
  intent: Intent;
}

interface QuickCategory {
  key: CategoryKey;
  label: string;
  options: QuickOption[];
}

const quickCategories: QuickCategory[] = [
  {
    key: "policies",
    label: "My Policies",
    options: [
      { label: "How many policies do I have?", intent: "policy_count" },
      { label: "Which policies are active?", intent: "active_policies" },
      { label: "What coverage do I have?", intent: "coverage_details" },
      { label: "Who is my agent?", intent: "agent_details" },
      { label: "Show my policy details", intent: "policy_details" },
    ],
  },
  {
    key: "claims",
    label: "My Claims",
    options: [
      { label: "Which claims are pending?", intent: "pending_claims" },
      { label: "Which claims are active?", intent: "active_claims" },
      { label: "Which claims are approved?", intent: "approved_claims" },
      { label: "Which claims are rejected?", intent: "rejected_claims" },
      { label: "Show all claim details", intent: "claim_details" },
    ],
  },
  {
    key: "payments",
    label: "Payments",
    options: [
      { label: "Is any payment pending?", intent: "pending_payments" },
      { label: "What is my next payment due?", intent: "next_payment_due" },
      { label: "Show my payment history", intent: "payment_history" },
      { label: "Show billing summary", intent: "billing_summary" },
    ],
  },
];

const createMessage = (sender: Sender, text: string): ChatMessage => ({
  id: `${sender}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  sender,
  text,
  timestamp: new Date(),
});

const normalize = (value?: string | null) => (value || "").trim().toLowerCase();
const hasAny = (text: string, words: string[]) => words.some((word) => text.includes(word));

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
  items.length > 0 ? items.map((item, index) => `${index + 1}. ${item}`).join("\n") : emptyText;

const formatAddress = (policy: Policy) => {
  const address = policy.propertyAddress;
  if (!address) return "";

  return [address.addressLine1, address.city, address.state, address.zipCode].filter(Boolean).join(", ");
};

export function Chatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("policies");
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    createMessage(
      "bot",
      "Hi, I can answer questions about your policies, claims, coverage, agent, billing, due dates, and payment history. Type anything or choose a topic."
    ),
  ]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [billing, setBilling] = useState<Billing[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const loadedForEmailRef = useRef<string | null>(null);

  const selectedOptions = useMemo(
    () => quickCategories.find((category) => category.key === selectedCategory)?.options ?? [],
    [selectedCategory]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isOpen || !user?.email || loadedForEmailRef.current === user.email) return;

    const controller = new AbortController();
    const email = user.email;

    async function loadChatbotData() {
      setIsLoadingData(true);
      setDataError(null);

      try {
        const userPolicies = await getPoliciesByEmail(email, controller.signal);
        const numbers = userPolicies.map((policy) => policy.policyNumber).filter(Boolean);
        const [userClaims, userBilling] = await Promise.all([
          getClaimsByPolicyNumbers(numbers, controller.signal),
          getBillingByPolicyNumbers(numbers, controller.signal),
        ]);

        setPolicies(userPolicies);
        setClaims(userClaims);
        setBilling(userBilling);
        loadedForEmailRef.current = email;
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

  const getIntentAnswer = useCallback(
    (intent: Intent) => {
      if (isLoadingData) {
        return "I am loading your account details. Please try again in a moment.";
      }

      if (dataError) {
        return `I could not load your account details right now. ${dataError}`;
      }

      const activePolicies = policies.filter(isPolicyActive);
      const expiredPolicies = policies.filter(isPolicyExpired);
      const pendingClaims = getClaimMatches(claims, "pending");
      const activeClaims = getClaimMatches(claims, "active");
      const approvedClaims = getClaimMatches(claims, "approved");
      const rejectedClaims = getClaimMatches(claims, "rejected");
      const dueBills = billing.filter((bill) => Number(bill.currentAmountDue || 0) > 0);
      const totalBalance = billing.reduce((sum, bill) => sum + Number(bill.accountTotalBalance || 0), 0);

      switch (intent) {
        case "greeting":
          return "Hi. Ask me anything about your policies, claims, payments, coverage, agent, due dates, or account summary.";

        case "help":
          return "You can ask questions like: What policies do I have? Who is my agent? What coverage do I have? Are any payments due? What is my claim status?";

        case "account_summary":
          return `Account summary: ${policies.length} polic${policies.length === 1 ? "y" : "ies"}, ${activePolicies.length} active, ${claims.length} claim${claims.length === 1 ? "" : "s"}, and ${formatCurrency(totalBalance)} total billing balance.`;

        case "policy_count":
          return `You have ${policies.length} polic${policies.length === 1 ? "y" : "ies"}. ${activePolicies.length} active, ${expiredPolicies.length} expired.`;

        case "active_policies":
          return listLines(
            activePolicies.map(
              (policy) =>
                `${policy.policyNumber} - ${policy.policyType || "Insurance"} - expires ${formatDate(policy.expirationDate)}`
            ),
            "You do not have any active policies right now."
          );

        case "expired_policies":
          return listLines(
            expiredPolicies.map(
              (policy) =>
                `${policy.policyNumber} - ${policy.policyType || "Insurance"} - expired ${formatDate(policy.expirationDate)}`
            ),
            "You do not have any expired policies right now."
          );

        case "policy_details":
          return listLines(
            policies.map(
              (policy) =>
                `${policy.policyNumber} - ${policy.policyType || "Insurance"} - ${policy.status || "Active"} - ${formatDate(policy.effectiveDate)} to ${formatDate(policy.expirationDate)}`
            ),
            "I could not find any policies for your account."
          );

        case "coverage_details":
          return listLines(
            policies.map((policy) => {
              const coverageText =
                policy.coverages && policy.coverages.length > 0
                  ? policy.coverages
                      .map((coverage) =>
                        `${coverage.name || "Coverage"}${coverage.limit ? ` ${formatCurrency(Number(coverage.limit))}` : ""}`
                      )
                      .join(", ")
                  : "No coverage details listed";

              return `${policy.policyNumber} - ${coverageText}`;
            }),
            "I could not find coverage details for your policies."
          );

        case "agent_details":
          return listLines(
            policies.map((policy) => {
              const agent = policy.agent;
              if (!agent?.name && !agent?.phone && !agent?.email) {
                return `${policy.policyNumber} - no agent details listed`;
              }

              return `${policy.policyNumber} - ${[agent?.name, agent?.phone, agent?.email].filter(Boolean).join(" - ")}`;
            }),
            "I could not find agent details for your policies."
          );

        case "property_address":
          return listLines(
            policies.map((policy) => `${policy.policyNumber} - ${formatAddress(policy) || "No property address listed"}`),
            "I could not find property address details for your policies."
          );

        case "billing_summary":
          return listLines(
            billing.map(
              (bill) =>
                `${bill.PolicyNumber} - balance ${formatCurrency(Number(bill.accountTotalBalance || 0))}, current due ${formatCurrency(Number(bill.currentAmountDue || 0))} on ${formatDate(bill.currentDueDate)}`
            ),
            "I could not find billing details for your policies."
          );

        case "pending_claims":
          return listLines(
            pendingClaims.map(
              (claim) =>
                `${claim.ClaimNumber} - ${claim.DescriptionOfLoss || "Claim"} - received ${formatDate(claim.ReceivedDate)}`
            ),
            "You do not have any pending claims right now."
          );

        case "active_claims":
          return listLines(
            activeClaims.map(
              (claim) =>
                `${claim.ClaimNumber} - ${claim.DescriptionOfLoss || "Claim"} - loss date ${formatDate(claim.LossDate)}`
            ),
            "You do not have any active claims right now."
          );

        case "approved_claims":
          return listLines(
            approvedClaims.map(
              (claim) =>
                `${claim.ClaimNumber} - ${claim.DescriptionOfLoss || "Claim"} - paid ${formatCurrency(Number(claim.PaidLoss || 0))}`
            ),
            "You do not have any approved claims right now."
          );

        case "rejected_claims":
          return listLines(
            rejectedClaims.map(
              (claim) =>
                `${claim.ClaimNumber} - ${claim.DescriptionOfLoss || "Claim"} - policy ${claim.PolicyNumber}`
            ),
            "You do not have any rejected claims right now."
          );

        case "claim_details":
          return listLines(
            claims.map(
              (claim) =>
                `${claim.ClaimNumber} - policy ${claim.PolicyNumber} - ${claim.Status || "Status unavailable"} - ${claim.DescriptionOfLoss || "Claim"}`
            ),
            "I could not find any claims for your policies."
          );

        case "pending_payments":
          return listLines(
            dueBills.map(
              (bill) =>
                `${bill.PolicyNumber} - ${formatCurrency(Number(bill.currentAmountDue || 0))} due ${formatDate(bill.currentDueDate)}`
            ),
            "You do not have any pending payments right now."
          );

        case "next_payment_due": {
          const nextBill = dueBills
            .filter((bill) => bill.currentDueDate)
            .sort(
              (a, b) =>
                new Date(a.currentDueDate || "").getTime() -
                new Date(b.currentDueDate || "").getTime()
            )[0];

          if (!nextBill) return "I could not find an upcoming payment due for your policies.";

          return `Your next payment is ${formatCurrency(Number(nextBill.currentAmountDue || 0))} for policy ${nextBill.PolicyNumber}, due on ${formatDate(nextBill.currentDueDate)}.`;
        }

        case "payment_history": {
          const statements = billing
            .flatMap((bill) =>
              (bill.projectedStatements || []).map((statement) => ({
                ...statement,
                policy: statement.policy || bill.PolicyNumber,
              }))
            )
            .filter((statement) => normalize(statement.status).includes("paid"))
            .sort(
              (a, b) =>
                new Date(b.statementDueDate || "").getTime() -
                new Date(a.statementDueDate || "").getTime()
            )
            .slice(0, 4);

          return listLines(
            statements.map(
              (statement) =>
                `${statement.policy} - ${formatCurrency(Number(statement.statementTotalAmountDue || 0))} paid for ${formatDate(statement.statementDueDate)}`
            ),
            "I could not find recent paid statements for your account."
          );
        }

        case "recurring_payment":
          return listLines(
            billing.map(
              (bill) =>
                `${bill.PolicyNumber} - recurring payment is ${bill.isRecurringPayment ? "enabled" : "not enabled"}${bill.payPlanDesc ? ` (${bill.payPlanDesc})` : ""}`
            ),
            "I could not find recurring payment details for your policies."
          );
      }
    },
    [billing, claims, dataError, isLoadingData, policies]
  );

  const detectIntent = (message: string): Intent | null => {
    const text = normalize(message);

    if (hasAny(text, ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"])) return "greeting";
    if (hasAny(text, ["help", "what can you do", "options", "questions"])) return "help";
    if (hasAny(text, ["summary", "overview", "account", "dashboard"])) return "account_summary";
    if (hasAny(text, ["agent", "producer", "representative", "contact person"])) return "agent_details";
    if (hasAny(text, ["coverage", "coverages", "covered", "limit", "limits"])) return "coverage_details";
    if (hasAny(text, ["address", "property", "location"]) && !text.includes("claim")) return "property_address";
    if (hasAny(text, ["balance", "bill", "billing", "invoice", "amount", "premium"])) return "billing_summary";
    if (hasAny(text, ["autopay", "auto pay", "recurring", "pay plan", "payment plan"])) return "recurring_payment";
    if (hasAny(text, ["how many", "count", "total", "number of"]) && text.includes("polic")) return "policy_count";
    if (text.includes("active") && text.includes("polic")) return "active_policies";
    if (hasAny(text, ["expired", "cancelled", "canceled", "inactive"]) && text.includes("polic")) return "expired_policies";
    if (text.includes("polic")) return "policy_details";
    if (text.includes("pending") && text.includes("claim")) return "pending_claims";
    if (text.includes("active") && text.includes("claim")) return "active_claims";
    if (hasAny(text, ["approved", "paid", "settled"]) && text.includes("claim")) return "approved_claims";
    if (hasAny(text, ["rejected", "denied", "declined"]) && text.includes("claim")) return "rejected_claims";
    if (text.includes("claim")) return "claim_details";
    if (hasAny(text, ["pending", "due", "owed", "unpaid"]) && hasAny(text, ["payment", "premium", "bill", "invoice"])) return "pending_payments";
    if (hasAny(text, ["next", "upcoming", "when"]) && hasAny(text, ["payment", "premium", "bill", "due"])) return "next_payment_due";
    if (hasAny(text, ["history", "past", "previous", "paid"]) && hasAny(text, ["payment", "premium", "bill", "invoice"])) return "payment_history";

    return null;
  };

  const getSmartFallbackAnswer = useCallback(
    (message: string) => {
      const text = normalize(message);

      if (isLoadingData) {
        return "I am loading your account details. Please try again in a moment.";
      }

      if (dataError) {
        return `I could not load your account details right now. ${dataError}`;
      }

      const matchedPolicy = policies.find((policy) => text.includes(normalize(policy.policyNumber)));
      if (matchedPolicy) {
        const bill = billing.find((item) => item.PolicyNumber === matchedPolicy.policyNumber);
        const policyClaims = claims.filter((claim) => claim.PolicyNumber === matchedPolicy.policyNumber);
        const address = formatAddress(matchedPolicy);

        return [
          `${matchedPolicy.policyNumber} - ${matchedPolicy.policyType || "Insurance"} - ${matchedPolicy.status || "Status unavailable"}`,
          `Dates: ${formatDate(matchedPolicy.effectiveDate)} to ${formatDate(matchedPolicy.expirationDate)}`,
          matchedPolicy.agent ? `Agent: ${[matchedPolicy.agent.name, matchedPolicy.agent.phone, matchedPolicy.agent.email].filter(Boolean).join(" - ")}` : "",
          address ? `Property: ${address}` : "",
          bill ? `Billing: ${formatCurrency(Number(bill.currentAmountDue || 0))} due ${formatDate(bill.currentDueDate)}` : "",
          `Claims: ${policyClaims.length}`,
        ]
          .filter(Boolean)
          .join("\n");
      }

      const matchedClaim = claims.find((claim) => text.includes(normalize(claim.ClaimNumber)));
      if (matchedClaim) {
        return [
          `${matchedClaim.ClaimNumber} - ${matchedClaim.Status || "Status unavailable"}`,
          `Policy: ${matchedClaim.PolicyNumber}`,
          `Loss: ${matchedClaim.DescriptionOfLoss || "No description listed"}`,
          `Received: ${formatDate(matchedClaim.ReceivedDate)}`,
          matchedClaim.MainAdjusterName ? `Adjuster: ${matchedClaim.MainAdjusterName}` : "",
        ]
          .filter(Boolean)
          .join("\n");
      }

      const topicMatches: Array<{ label: string; intent: Intent; score: number }> = [
        { label: "account summary", intent: "account_summary" as const, score: hasAny(text, ["my", "me", "i", "account"]) ? 1 : 0 },
        { label: "policy details", intent: "policy_details" as const, score: hasAny(text, ["policy", "policies", "insurance"]) ? 2 : 0 },
        { label: "claim details", intent: "claim_details" as const, score: hasAny(text, ["claim", "loss", "adjuster"]) ? 2 : 0 },
        { label: "billing details", intent: "billing_summary" as const, score: hasAny(text, ["pay", "payment", "bill", "billing", "money", "premium", "due"]) ? 2 : 0 },
        { label: "agent details", intent: "agent_details" as const, score: hasAny(text, ["call", "email", "phone", "contact", "agent"]) ? 2 : 0 },
      ].sort((a, b) => b.score - a.score);

      if (topicMatches[0]?.score > 0) {
        return getIntentAnswer(topicMatches[0].intent);
      }

      return "I can answer account questions using your portal data: policies, coverage, agents, claims, billing, due dates, payment history, and autopay. Try asking your question with a policy number, claim number, or one of those topics.";
    },
    [billing, claims, dataError, getIntentAnswer, isLoadingData, policies]
  );

  const sendBotResponse = useCallback(
    (answer: string) => {
      window.setTimeout(() => {
        setMessages((current) => [...current, createMessage("bot", answer)]);
      }, 250);
    },
    []
  );

  const handleCategoryClick = (category: QuickCategory) => {
    setSelectedCategory(category.key);
    setMessages((current) => [
      ...current,
      createMessage("user", category.label),
      createMessage("bot", `Sure. Choose one of the ${category.label.toLowerCase()} questions below.`),
    ]);
  };

  const handleQuickOptionClick = (option: QuickOption) => {
    setMessages((current) => [...current, createMessage("user", option.label)]);
    sendBotResponse(getIntentAnswer(option.intent));
  };

  const handleSendMessage = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;

    const matchedIntent = detectIntent(trimmedValue);
    setInputValue("");
    setMessages((current) => [...current, createMessage("user", trimmedValue)]);

    if (matchedIntent) {
      sendBotResponse(getIntentAnswer(matchedIntent));
      return;
    }

    sendBotResponse(getSmartFallbackAnswer(trimmedValue));
  };

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

          <div className="border-b border-slate-100 bg-white px-4 py-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {quickCategories.map((category) => (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => handleCategoryClick(category)}
                  className={`shrink-0 rounded-full border px-3 py-2 text-xs font-medium transition ${
                    selectedCategory === category.key
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
            <div className="mt-3 grid gap-2">
              {selectedOptions.map((option) => (
                <button
                  key={option.intent}
                  type="button"
                  onClick={() => handleQuickOptionClick(option)}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"
                >
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
            {messages.map((message) => {
              const isUser = message.sender === "user";

              return (
                <div key={message.id} className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
                  {!isUser && (
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700">
                      <Bot className="h-4 w-4" aria-hidden="true" />
                    </div>
                  )}
                  <div className={`max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
                    <div
                      className={`whitespace-pre-line rounded-2xl px-3 py-2 text-sm leading-5 ${
                        isUser
                          ? "rounded-br-md bg-blue-600 text-white"
                          : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
                      }`}
                    >
                      {message.text}
                    </div>
                    <p className={`mt-1 text-[10px] text-slate-400 ${isUser ? "text-right" : "text-left"}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
            onSubmit={(event) => {
              event.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Type your question..."
              aria-label="Type your question"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl shadow-blue-600/30 transition duration-300 hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
        aria-label={isOpen ? "Hide assistant" : "Open assistant"}
      >
        {isOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <MessageCircle className="h-6 w-6" aria-hidden="true" />}
      </button>
    </div>
  );
}
