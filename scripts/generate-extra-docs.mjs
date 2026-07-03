import { createWriteStream } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const docsDir = resolve(rootDir, "docs");

const page = {
  margin: 42,
  width: 595.28,
  height: 841.89,
};

function waitForFinish(stream) {
  return new Promise((resolvePromise, reject) => {
    stream.on("finish", resolvePromise);
    stream.on("error", reject);
  });
}

function ensureSpace(doc, height = 36) {
  if (doc.y + height > page.height - page.margin) {
    doc.addPage();
  }
}

function heading(doc, text, level = 1) {
  const sizes = { 1: 22, 2: 16, 3: 12 };
  ensureSpace(doc, level === 1 ? 70 : 44);
  doc.moveDown(level === 1 ? 0.2 : 0.7);
  doc
    .font("Helvetica-Bold")
    .fontSize(sizes[level] || 12)
    .fillColor(level === 1 ? "#0a2947" : "#172033")
    .text(text, { width: page.width - page.margin * 2 });
  if (level <= 2) {
    const y = doc.y + 4;
    doc
      .moveTo(page.margin, y)
      .lineTo(page.width - page.margin, y)
      .strokeColor(level === 1 ? "#0a2947" : "#d7dee8")
      .lineWidth(level === 1 ? 1 : 0.5)
      .stroke();
    doc.moveDown(0.6);
  } else {
    doc.moveDown(0.25);
  }
}

function paragraph(doc, text, options = {}) {
  ensureSpace(doc, 28);
  doc
    .font(options.bold ? "Helvetica-Bold" : "Helvetica")
    .fontSize(options.size || 10)
    .fillColor(options.color || "#172033")
    .text(text, {
      width: page.width - page.margin * 2,
      lineGap: options.lineGap ?? 2,
    });
  doc.moveDown(options.after ?? 0.45);
}

function bullet(doc, text) {
  paragraph(doc, `- ${text}`, { after: 0.25 });
}

function table(doc, headers, rows, widths) {
  const left = page.margin;
  const rowHeight = 24;
  const cellPadding = 5;

  function drawRow(values, isHeader = false) {
    ensureSpace(doc, rowHeight + 8);
    let x = left;
    const y = doc.y;
    values.forEach((value, index) => {
      const width = widths[index];
      doc
        .rect(x, y, width, rowHeight)
        .fillAndStroke(isHeader ? "#e8eef6" : "#ffffff", "#d7dee8");
      doc
        .font(isHeader ? "Helvetica-Bold" : "Helvetica")
        .fontSize(8.4)
        .fillColor("#172033")
        .text(String(value), x + cellPadding, y + 7, {
          width: width - cellPadding * 2,
          height: rowHeight - 8,
          ellipsis: true,
        });
      x += width;
    });
    doc.y = y + rowHeight;
  }

  drawRow(headers, true);
  rows.forEach((row) => drawRow(row));
  doc.moveDown(0.8);
}

async function writePdf(filename, title, render) {
  const outputPath = resolve(docsDir, filename);
  const doc = new PDFDocument({
    size: "A4",
    margin: page.margin,
    info: {
      Title: title,
      Author: "ProveIt",
      Subject: title,
    },
  });

  const stream = createWriteStream(outputPath);
  doc.pipe(stream);

  heading(doc, title, 1);
  paragraph(
    doc,
    "Generated from the current ProveIt codebase and documentation.",
    { color: "#516071" },
  );
  render(doc);

  doc.end();
  await waitForFinish(stream);
  console.log(`Generated ${outputPath}`);
}

const apiSections = [
  {
    name: "Public",
    endpoints: [
      ["GET", "/health", "Backend health check", "Public"],
      ["GET", "/api/blog", "List published localized blog posts", "Public"],
      ["GET", "/api/blog/:slug", "Read one published blog post by slug", "Public"],
    ],
  },
  {
    name: "User, Score, and Leaderboard",
    endpoints: [
      ["GET", "/api/users/leaderboard", "Rank users by score", "Auth"],
      ["GET", "/api/users/me/score-summary", "Current user's score, level, and rank", "Auth"],
      ["GET", "/api/users/me/solved-problems", "Solved problem history", "Auth"],
    ],
  },
  {
    name: "Sessions",
    endpoints: [
      ["POST", "/api/sessions", "Create a live coding session by difficulty", "Auth"],
      ["GET", "/api/sessions/active", "List active sessions", "Auth"],
      ["GET", "/api/sessions/my-recent", "List current user's recent sessions", "Auth"],
      ["GET", "/api/sessions/:id", "Get session details", "Auth"],
      ["POST", "/api/sessions/:id/join", "Join a session", "Auth"],
      ["POST", "/api/sessions/:id/leave", "Leave a session", "Auth"],
      ["PATCH", "/api/sessions/:id/problem", "Persist selected problem", "Auth"],
      ["POST", "/api/sessions/:id/start-notification", "Notify the other participant that the session started", "Auth"],
      ["POST", "/api/sessions/:id/end", "End a session", "Auth"],
    ],
  },
  {
    name: "Scheduling and Invitations",
    endpoints: [
      ["GET", "/api/availability/me", "Get current user's weekly availability", "Auth"],
      ["PUT", "/api/availability/me", "Update weekly availability", "Auth"],
      ["GET", "/api/availability/:userId", "Get another user's availability", "Auth"],
      ["GET", "/api/invitations/search-users", "Search schedule candidates by name and level", "Auth"],
      ["GET", "/api/invitations/me", "List sent and received invitations", "Auth"],
      ["GET", "/api/invitations/pending-count", "Unread pending invitation count", "Auth"],
      ["POST", "/api/invitations", "Send a scheduled invitation", "Auth"],
      ["POST", "/api/invitations/:invitationId/respond", "Accept or decline invitation", "Auth"],
    ],
  },
  {
    name: "Notifications and Code",
    endpoints: [
      ["GET", "/api/notifications", "List current user's notifications", "Auth"],
      ["PATCH", "/api/notifications/read-all", "Mark all notifications as read", "Auth"],
      ["PATCH", "/api/notifications/:id/read", "Mark one notification as read", "Auth"],
      ["DELETE", "/api/notifications/:id", "Delete one notification", "Auth"],
      ["POST", "/api/code/execute", "Execute and evaluate submitted code with Judge0", "Auth"],
      ["GET", "/api/chat/token", "Issue Stream chat/video token", "Auth"],
    ],
  },
  {
    name: "AI Interview and Subscription",
    endpoints: [
      ["POST", "/api/ai-interview/upload-cv", "Upload and analyze PDF CV", "Auth"],
      ["GET", "/api/ai-interview/profile", "Get candidate profile", "Auth"],
      ["POST", "/api/ai-interview/start", "Start AI interview session", "Auth"],
      ["GET", "/api/ai-interview/history", "List AI interview history", "Auth"],
      ["POST", "/api/ai-interview/:sessionId/answer", "Submit answer and receive feedback", "Auth"],
      ["GET", "/api/ai-interview/:sessionId/results", "Get final interview results", "Auth"],
      ["GET", "/api/ai-interview/:sessionId", "Get AI interview session", "Auth"],
      ["GET", "/api/subscription/me", "Get current subscription", "Auth"],
      ["POST", "/api/subscription/simulate-payment", "Simulate plan purchase", "Auth"],
      ["POST", "/api/subscription/cancel", "Cancel subscription", "Auth"],
      ["GET", "/api/subscription/check-limit", "Check AI interview usage limit", "Auth"],
    ],
  },
  {
    name: "Admin",
    endpoints: [
      ["POST", "/api/admin/login", "Admin session bootstrap", "Admin"],
      ["GET", "/api/admin/stats/dashboard", "Dashboard totals", "Admin"],
      ["GET", "/api/admin/stats/sessions-over-time", "Session chart data", "Admin"],
      ["GET", "/api/admin/stats/interviews-per-day", "AI interview chart data", "Admin"],
      ["GET", "/api/admin/users", "Paginated users", "Admin"],
      ["PATCH", "/api/admin/users/:userId/role", "Update role", "Admin"],
      ["GET", "/api/admin/sessions", "Paginated sessions", "Admin"],
      ["GET", "/api/admin/ai-interviews", "Paginated AI interviews", "Admin"],
      ["GET", "/api/admin/top-candidates", "Top candidate analytics", "Admin"],
      ["GET", "/api/admin/problems-stats", "Problem/category stats", "Admin"],
      ["GET", "/api/admin/blog-posts", "List admin blog posts", "Admin"],
      ["POST", "/api/admin/blog-posts", "Create blog post", "Admin"],
      ["PUT", "/api/admin/blog-posts/:id", "Update blog post", "Admin"],
      ["DELETE", "/api/admin/blog-posts/:id", "Delete blog post", "Admin"],
    ],
  },
];

const sprintRows = [
  ["1", "Foundation", "Auth, API shell, MongoDB models, public pages", "Done"],
  ["2", "Practice Problems", "Problem pages, Judge0 execution, scoring persistence", "Done"],
  ["3", "Sessions", "Stream calls, collaborative workspace, dynamic problem choice", "Done"],
  ["4", "Scheduling", "Availability grid, invitations, level filters, email hooks", "Done"],
  ["5", "Dashboard", "Leaderboard, solved problems, score/rank cards", "Done"],
  ["6", "AI Interview", "CV analysis, adaptive questions, answers, results", "Done"],
  ["7", "Admin", "Angular dashboard, analytics, users, sessions, blog management", "Done"],
  ["8", "Blog", "Database blog posts, public detail route, Arabic/RTL support", "Done"],
  ["9", "Responsive UX", "Mobile/RTL navigation, footer, home page, overflow fixes", "Done"],
  ["10", "Docs", "Schema, SRS, diagrams, API documentation, backlog exports", "Done"],
];

await writePdf("API_Documentation.pdf", "ProveIt API Documentation", (doc) => {
  paragraph(doc, "Base API path: /api. Authenticated routes use Clerk-backed Bearer tokens. Admin routes require an authenticated user with the admin role.");
  apiSections.forEach((section) => {
    heading(doc, section.name, 2);
    table(doc, ["Method", "Path", "Purpose", "Access"], section.endpoints, [44, 190, 218, 58]);
  });
});

await writePdf("Sprint_Backlog.pdf", "ProveIt Sprint Backlog", (doc) => {
  paragraph(doc, "This backlog summarizes the major delivered increments visible in the current repository.");
  table(doc, ["Sprint", "Theme", "Scope", "Status"], sprintRows, [45, 110, 290, 58]);

  heading(doc, "Key Acceptance Themes", 2);
  [
    "Guests can open public pages and the blog without authentication.",
    "Authenticated users can solve problems, earn score, and see their rank.",
    "Users can schedule sessions by difficulty and choose problems inside sessions.",
    "Invitation, notification, and email flows support accepted and started sessions.",
    "Admins can manage users, sessions, analytics, and blog posts.",
    "Arabic translation, RTL layout, and responsive behavior are supported across the main surfaces.",
  ].forEach((item) => bullet(doc, item));
});
