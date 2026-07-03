import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const docsDir = resolve(rootDir, "docs");

const font = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01111", "10000", "10000", "10011", "10001", "10001", "01110"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  0: ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  1: ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  2: ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  3: ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  4: ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  5: ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
  6: ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
  7: ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  8: ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  9: ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  "/": ["00001", "00001", "00010", "00100", "01000", "10000", "10000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
  "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
  ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"],
  "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
  "*": ["00000", "10101", "01110", "11111", "01110", "10101", "00000"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
};

const colors = {
  bg: [248, 250, 252, 255],
  ink: [23, 32, 51, 255],
  muted: [75, 88, 105, 255],
  line: [72, 96, 123, 255],
  border: [182, 199, 218, 255],
  blue: [234, 243, 255, 255],
  green: [246, 255, 244, 255],
  white: [255, 255, 255, 255],
  header: [10, 41, 71, 255],
};

function canvas(width, height) {
  const pixels = Buffer.alloc(width * height * 4);
  const c = { width, height, pixels };
  fill(c, 0, 0, width, height, colors.bg);
  return c;
}

function setPixel(c, x, y, color) {
  if (x < 0 || y < 0 || x >= c.width || y >= c.height) return;
  const i = (Math.floor(y) * c.width + Math.floor(x)) * 4;
  pixelsSet(c.pixels, i, color);
}

function pixelsSet(buffer, index, color) {
  buffer[index] = color[0];
  buffer[index + 1] = color[1];
  buffer[index + 2] = color[2];
  buffer[index + 3] = color[3];
}

function fill(c, x, y, w, h, color) {
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) setPixel(c, xx, yy, color);
  }
}

function rect(c, x, y, w, h, fillColor = colors.white, borderColor = colors.border) {
  fill(c, x, y, w, h, fillColor);
  line(c, x, y, x + w, y, borderColor, 2);
  line(c, x, y + h, x + w, y + h, borderColor, 2);
  line(c, x, y, x, y + h, borderColor, 2);
  line(c, x + w, y, x + w, y + h, borderColor, 2);
}

function line(c, x1, y1, x2, y2, color = colors.line, thickness = 2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  for (let i = 0; i <= steps; i += 1) {
    const x = x1 + (dx * i) / steps;
    const y = y1 + (dy * i) / steps;
    fill(c, Math.round(x - thickness / 2), Math.round(y - thickness / 2), thickness, thickness, color);
  }
}

function arrow(c, x1, y1, x2, y2, label = "") {
  line(c, x1, y1, x2, y2, colors.line, 3);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = 12;
  const a1 = angle + Math.PI * 0.78;
  const a2 = angle - Math.PI * 0.78;
  line(c, x2, y2, x2 + Math.cos(a1) * size, y2 + Math.sin(a1) * size, colors.line, 3);
  line(c, x2, y2, x2 + Math.cos(a2) * size, y2 + Math.sin(a2) * size, colors.line, 3);
  if (label) text(c, label, (x1 + x2) / 2 - 25, (y1 + y2) / 2 - 22, 2, colors.muted);
}

function text(c, value, x, y, scale = 2, color = colors.ink) {
  const str = String(value).toUpperCase();
  let cursor = x;
  for (const char of str) {
    const glyph = font[char] || font[" "];
    glyph.forEach((row, gy) => {
      [...row].forEach((bit, gx) => {
        if (bit === "1") fill(c, cursor + gx * scale, y + gy * scale, scale, scale, color);
      });
    });
    cursor += 6 * scale;
  }
}

function wrap(value, maxChars) {
  const words = String(value).split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    if (`${current} ${word}`.trim().length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  }
  if (current) lines.push(current);
  return lines;
}

function box(c, x, y, w, h, title, lines = [], fillColor = colors.white) {
  rect(c, x, y, w, h, fillColor, colors.border);
  text(c, title, x + 16, y + 16, 3, colors.header);
  let yy = y + 54;
  lines.flatMap((item) => wrap(item, Math.floor((w - 34) / 13))).forEach((item) => {
    text(c, item, x + 18, yy, 2, colors.ink);
    yy += 22;
  });
}

function title(c, heading, subtitle) {
  text(c, heading, 40, 30, 4, colors.header);
  text(c, subtitle, 42, 78, 2, colors.muted);
  line(c, 40, 112, c.width - 40, 112, [210, 222, 236, 255], 3);
}

function crc32(buffer) {
  let crc = -1;
  for (const byte of buffer) {
    crc ^= byte;
    for (let k = 0; k < 8; k += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function save(c, fileName) {
  const raw = Buffer.alloc((c.width * 4 + 1) * c.height);
  for (let y = 0; y < c.height; y += 1) {
    raw[y * (c.width * 4 + 1)] = 0;
    c.pixels.copy(raw, y * (c.width * 4 + 1) + 1, y * c.width * 4, (y + 1) * c.width * 4);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(c.width, 0);
  header.writeUInt32BE(c.height, 4);
  header[8] = 8;
  header[9] = 6;
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  const output = resolve(docsDir, fileName);
  writeFileSync(output, png);
  console.log(`Generated ${output}`);
}

function erd() {
  const c = canvas(1400, 950);
  title(c, "PROVEIT ERD", "MONGODB COLLECTIONS AND PRIMARY RELATIONSHIPS");
  box(c, 70, 150, 230, 150, "USER", ["name email clerkId", "role score level", "scoreStats timestamps"], colors.blue);
  box(c, 395, 140, 240, 140, "SESSION", ["difficulty problem", "host participant", "selectedProblemId callId"]);
  box(c, 735, 140, 245, 150, "INVITATION", ["sender recipient", "date time duration", "difficulty status sessionId"]);
  box(c, 1070, 150, 245, 140, "NOTIFICATION", ["recipient sender", "type status", "related session invitation"]);
  box(c, 70, 395, 230, 130, "CODE", ["submission attempts", "accepted scoreDelta", "points bonuses"]);
  box(c, 395, 395, 240, 120, "AVAILABILITY", ["user weeklySchedule", "timezone"]);
  box(c, 735, 395, 245, 125, "SUBSCRIPTION", ["user plan status", "AI interview limits"]);
  box(c, 1070, 395, 245, 135, "BLOGPOST", ["localized fields", "slug content", "published state"], colors.green);
  box(c, 80, 660, 245, 145, "PROFILE", ["candidate profile", "CV analysis", "skills history"]);
  box(c, 485, 655, 270, 155, "AI INTERVIEW", ["questions answers", "feedback score", "final report"]);
  box(c, 930, 665, 250, 130, "QUESTIONS", ["question bank", "category difficulty", "expected signals"]);
  arrow(c, 300, 220, 395, 210, "hosts");
  arrow(c, 635, 210, 735, 215, "creates");
  arrow(c, 980, 220, 1070, 220, "notifies");
  arrow(c, 185, 300, 185, 395, "submits");
  arrow(c, 300, 460, 395, 455, "has");
  arrow(c, 300, 470, 735, 460, "owns");
  arrow(c, 200, 525, 205, 660, "profile");
  arrow(c, 325, 735, 485, 735, "starts");
  arrow(c, 755, 735, 930, 730, "uses");
  save(c, "ERD.png");
}

function useCase() {
  const c = canvas(1400, 950);
  title(c, "PROVEIT USE CASE", "PRIMARY ACTORS AND PLATFORM CAPABILITIES");
  box(c, 70, 160, 220, 115, "GUEST", ["view public pages", "read blog", "sign in"], colors.blue);
  box(c, 70, 390, 220, 170, "USER", ["solve problems", "create sessions", "schedule invites", "AI interviews", "subscription"], colors.blue);
  box(c, 70, 700, 220, 120, "ADMIN", ["analytics", "manage users", "manage blog"], colors.blue);
  box(c, 430, 135, 270, 110, "PUBLIC SITE", ["home pricing about", "blog listing detail"]);
  box(c, 430, 290, 270, 120, "PRACTICE", ["filter problems", "run Judge0 code", "award score"]);
  box(c, 430, 465, 270, 125, "SESSIONS", ["Stream video chat", "select problem", "collaborative code"]);
  box(c, 430, 650, 270, 125, "SCHEDULING", ["availability", "invitations", "notifications email"]);
  box(c, 845, 235, 280, 125, "AI INTERVIEW", ["CV upload", "questions answers", "results history"]);
  box(c, 845, 445, 280, 115, "SUBSCRIPTION", ["plans", "usage limits", "payment simulation"]);
  box(c, 845, 690, 280, 130, "ADMIN DASH", ["stats charts", "users sessions", "blog CRUD"]);
  arrow(c, 290, 210, 430, 190, "views");
  arrow(c, 290, 475, 430, 350, "uses");
  arrow(c, 290, 475, 430, 525, "uses");
  arrow(c, 290, 475, 430, 710, "uses");
  arrow(c, 700, 525, 845, 300, "uses");
  arrow(c, 700, 710, 845, 505, "uses");
  arrow(c, 290, 760, 845, 760, "manages");
  save(c, "Use_Case_Diagram.png");
}

function classDiagram() {
  const c = canvas(1500, 1050);
  title(c, "PROVEIT CLASS DIAGRAM", "MAIN DOMAIN MODELS AND SERVICE BOUNDARIES");
  box(c, 60, 145, 260, 165, "USER", ["name email", "role score level", "scoreStats"]);
  box(c, 410, 145, 290, 170, "SESSION", ["difficulty", "host participant", "selectedProblemId", "status callId"]);
  box(c, 790, 145, 290, 175, "INVITATION", ["sender recipient", "scheduled date time", "difficulty status"]);
  box(c, 1170, 145, 270, 150, "NOTIFICATION", ["recipient sender", "type status", "related entities"]);
  box(c, 60, 420, 260, 155, "SUBMISSION", ["problemId difficulty", "accepted", "scoreDelta"]);
  box(c, 410, 420, 290, 145, "AVAILABILITY", ["userId", "weeklySchedule", "timezone"]);
  box(c, 790, 420, 290, 145, "SUBSCRIPTION", ["plan status", "period", "AI limits"]);
  box(c, 1170, 420, 270, 165, "BLOGPOST", ["localized text", "slug content", "published"], colors.green);
  box(c, 115, 735, 300, 165, "PROFILE", ["userId", "CV analysis", "skills"]);
  box(c, 550, 720, 330, 190, "AI SESSION", ["userId", "questions answers", "feedback", "final scorecard"]);
  box(c, 1020, 735, 300, 145, "QUESTION BANK", ["category", "difficulty", "question text"]);
  arrow(c, 320, 230, 410, 230, "1-N");
  arrow(c, 700, 235, 790, 235, "0-1");
  arrow(c, 1080, 235, 1170, 235, "N");
  arrow(c, 190, 310, 190, 420, "N");
  arrow(c, 320, 500, 410, 500, "1");
  arrow(c, 320, 500, 790, 500, "1");
  arrow(c, 195, 575, 265, 735, "1");
  arrow(c, 415, 815, 550, 815, "N");
  arrow(c, 880, 815, 1020, 805, "USES");
  save(c, "Class_Diagram.png");
}

function architecture() {
  const c = canvas(1500, 1000);
  title(c, "PROVEIT ARCHITECTURE", "CLIENT APPS BACKEND API PERSISTENCE AND INTEGRATIONS");
  box(c, 80, 165, 280, 145, "REACT APP", ["Vite React", "Tailwind DaisyUI", "Clerk auth"], colors.blue);
  box(c, 80, 415, 280, 135, "ANGULAR ADMIN", ["admin dashboard", "analytics", "blog CRUD"], colors.blue);
  box(c, 80, 670, 280, 125, "GUESTS", ["marketing pages", "public blog", "pricing contact"], colors.blue);
  box(c, 540, 180, 320, 190, "EXPRESS API", ["REST routes under API", "Clerk middleware", "controllers services", "global error handler"]);
  box(c, 540, 500, 320, 150, "DOMAIN SERVICES", ["score service", "email service", "Stream integration", "AI provider layer"]);
  box(c, 1030, 145, 310, 140, "MONGODB", ["Mongoose models", "users sessions invites", "blog AI data"], colors.green);
  box(c, 1030, 345, 310, 135, "CLERK", ["authentication", "user identity", "Bearer tokens"]);
  box(c, 1030, 535, 310, 135, "STREAM", ["video calls", "chat channels", "user sync"]);
  box(c, 1030, 720, 310, 145, "EXTERNAL", ["Judge0 execution", "Resend email", "Inngest jobs", "OpenAI ITI gateway"]);
  arrow(c, 360, 240, 540, 270, "REST");
  arrow(c, 360, 480, 540, 300, "ADMIN");
  arrow(c, 360, 730, 540, 330, "PUBLIC");
  arrow(c, 860, 270, 1030, 215, "DB");
  arrow(c, 860, 280, 1030, 410, "AUTH");
  arrow(c, 860, 585, 1030, 605, "VIDEO");
  arrow(c, 860, 615, 1030, 780, "APIS");
  arrow(c, 700, 370, 700, 500, "USES");
  save(c, "Architecture_Diagram.png");
}

erd();
useCase();
classDiagram();
architecture();
