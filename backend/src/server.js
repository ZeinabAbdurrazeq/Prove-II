import express from "express";
import path from "path";
import cors from "cors";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";
import chatRoutes from "./routes/chatRoute.js";
import sessionRoutes from "./routes/sessionRoute.js";
import codeRoutes from "./routes/codeRoute.js";
import availabilityRoutes from "./routes/availabilityRoute.js";
import invitationRoutes from "./routes/invitationRoute.js";
import notificationRoutes from "./routes/notificationRoute.js";
import subscriptionRoutes from "./routes/subscriptionRoute.js";
import aiInterviewRoutes from "./routes/aiInterviewRoute.js";
import adminRoutes from "./routes/adminRoute.js";
import userRoutes from "./routes/userRoute.js";
import blogRoutes from "./routes/blogRoute.js";
import problemRoutes from "./routes/problemRoute.js";

const app = express();

const __dirname = path.resolve();
const allowedOrigins = [
  ENV.CLIENT_URL,
  "https://prove-it-b9lnm.sevalla.app",
  "https://proveit-dashboard-qq9q6.sevalla.page",
  "http://localhost:5173",
  "http://localhost:4200",
].filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(clerkMiddleware());
app.use(express.json());

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/code", codeRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/ai-interview", aiInterviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/problems", problemRoutes);

app.use("/api", (req, res) => {
  res.status(404).json({ msg: "Not Found" });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    message: "success from backend",
  });
});

if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

// Global error handler - keeps the server from crashing on unhandled errors
// and avoids leaking stack traces to clients.
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ msg: "Internal Server Error" });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => console.log("server running on port", ENV.PORT));
  } catch (error) {
    console.error("something went wrong: ", error);
  }
};

startServer();
