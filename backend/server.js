const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const connectDB = require("./config/db");
const validateEnv = require("./utils/validateEnv");
const errorHandler = require("./middleware/errorHandler");
const requestLogger = require("./middleware/logger");

const { buildUserContext } = require("./services/userContextService");
const { generateAnswer } = require("./services/llmService");

// Load env
dotenv.config({ path: path.join(__dirname, ".env") });

// Validate environment variables
validateEnv();

// Connect to MongoDB
connectDB();

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:3000",
    "http://localhost",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 600,
};

app.use(cors(corsOptions));

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  next();
});

// Middleware
app.use(requestLogger);
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Existing routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/policies", require("./routes/policyRoutes"));
app.use("/api/claims", require("./routes/claimRoutes"));
app.use("/api/billing", require("./routes/billingRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));

// Helper to detect Gemini quota/rate-limit errors safely
function isGeminiLimitError(error) {
  const errorText = JSON.stringify(error, Object.getOwnPropertyNames(error)).toLowerCase();

  return (
    errorText.includes("429") ||
    errorText.includes("quota") ||
    errorText.includes("too many requests") ||
    errorText.includes("rate limit") ||
    errorText.includes("limit")
  );
}

// 🔹 RAG FULL CHAT ROUTE (Gemini + Real User Data)
app.post("/api/chat/rag", async (req, res) => {
  const { message, email } = req.body;

  try {
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message is required and must be a non-empty string",
      });
    }

    if (!email || typeof email !== "string" || email.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "User email is required for account-specific chatbot answers",
      });
    }

    const userContext = await buildUserContext(email.trim());

    const finalContext = `
User Account Data:
${userContext}
`;

    let answer;

    try {
      answer = await generateAnswer(message.trim(), finalContext);
    } catch (llmError) {
      console.error("LLM error inside /api/chat/rag:", llmError);

      if (isGeminiLimitError(llmError)) {
        answer =
          "Limit exceeded - can't generate response right now. Please try again later.";
      } else {
        answer = "Something went wrong while generating the response.";
      }
    }

    // Extra safety: if llmService returns raw Gemini error text instead of throwing
    if (
      typeof answer === "string" &&
      (answer.includes("[GoogleGenerativeAI Error]") ||
        answer.includes("Too Many Requests") ||
        answer.includes("quota"))
    ) {
      answer =
        "Limit exceeded - can't generate response right now. Please try again later.";
    }

    return res.json({
      success: true,
      userQuestion: message,
      answer: answer || "I couldn't generate an answer. Please try again.",
      sources: [
        {
          title: "Real User Account Data",
          type: "mongodb",
        },
      ],
    });
  } catch (error) {
    console.error("RAG route error:", error);

    if (isGeminiLimitError(error)) {
      return res.json({
        success: true,
        userQuestion: message,
        answer:
          "Limit exceeded - can't generate response right now. Please try again later.",
        sources: [],
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong while processing the chatbot request.",
    });
  }
});

app.get("/", (req, res) => {
  res.json({
    message: "Insured Portal API is running",
    version: "1.0.0",
    status: "success",
    timestamp: new Date().toISOString(),
  });
});

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// 404 must be last before error handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    status: "error",
    path: req.path,
  });
});

// Error handler middleware must be last
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🚀 API ready at http://localhost:${PORT}/api`);
});

// Graceful Shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n📛 Received ${signal}. Starting graceful shutdown...`);

  server.close((err) => {
    if (err) {
      console.error("Error during server shutdown:", err);
      process.exit(1);
    }

    console.log("✅ Server closed");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("⚠️ Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});