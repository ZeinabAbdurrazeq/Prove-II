import { createWriteStream, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const docsDir = resolve(rootDir, "docs");

const docs = [
  "DB_SCHEMA",
  "SRS_PROVEIT_PLATFORM",
  "PROVEIT_DOCUMENTATION",
];

const PAGE = {
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

function cleanInlineMarkdown(value) {
  return String(value || "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<br\s*\/?>/gi, "\n")
    .trim();
}

function ensureSpace(doc, height = 40) {
  if (doc.y + height > PAGE.height - PAGE.margin) {
    doc.addPage();
  }
}

function writeParagraph(doc, text, options = {}) {
  const value = cleanInlineMarkdown(text);
  if (!value) return;

  ensureSpace(doc, 30);
  doc
    .font(options.font || "Helvetica")
    .fontSize(options.size || 10)
    .fillColor(options.color || "#172033")
    .text(value, {
      width: PAGE.width - PAGE.margin * 2,
      align: options.align || "left",
      lineGap: options.lineGap ?? 2,
    });
  doc.moveDown(options.after ?? 0.45);
}

function writeHeading(doc, rawLine) {
  const level = rawLine.match(/^#+/)?.[0]?.length || 1;
  const text = cleanInlineMarkdown(rawLine.replace(/^#+\s*/, ""));
  const sizes = { 1: 22, 2: 16, 3: 13, 4: 11 };
  const size = sizes[Math.min(level, 4)] || 11;

  ensureSpace(doc, level === 1 ? 70 : 45);
  doc.moveDown(level === 1 ? 0.2 : 0.6);
  doc
    .font("Helvetica-Bold")
    .fontSize(size)
    .fillColor("#0a2947")
    .text(text, { width: PAGE.width - PAGE.margin * 2 });

  if (level <= 2) {
    const y = doc.y + 3;
    doc
      .moveTo(PAGE.margin, y)
      .lineTo(PAGE.width - PAGE.margin, y)
      .strokeColor(level === 1 ? "#0a2947" : "#d7dee8")
      .lineWidth(level === 1 ? 1.5 : 0.8)
      .stroke();
    doc.y = y + 8;
  } else {
    doc.moveDown(0.25);
  }
}

function writeCodeBlock(doc, lines) {
  const text = lines.join("\n");
  ensureSpace(doc, 70);
  doc
    .font("Courier")
    .fontSize(8.5)
    .fillColor("#12314d")
    .text(text, {
      width: PAGE.width - PAGE.margin * 2,
      lineGap: 1,
    });
  doc.moveDown(0.7);
}

function parseTableRows(lines) {
  return lines
    .map((line) =>
      line
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cleanInlineMarkdown(cell)),
    )
    .filter((row) => !row.every((cell) => /^:?-{3,}:?$/.test(cell)));
}

function writeTable(doc, tableLines) {
  const rows = parseTableRows(tableLines);
  if (!rows.length) return;

  const columnCount = Math.max(...rows.map((row) => row.length));
  const tableWidth = PAGE.width - PAGE.margin * 2;
  const columnWidth = tableWidth / columnCount;

  doc.moveDown(0.3);
  rows.forEach((row, rowIndex) => {
    const heights = row.map((cell) =>
      doc.heightOfString(cell || " ", {
        width: columnWidth - 8,
        lineGap: 1,
      }),
    );
    const rowHeight = Math.max(22, ...heights.map((height) => height + 10));
    ensureSpace(doc, rowHeight + 8);

    const startY = doc.y;
    row.forEach((cell, index) => {
      const x = PAGE.margin + index * columnWidth;
      doc
        .rect(x, startY, columnWidth, rowHeight)
        .fillAndStroke(rowIndex === 0 ? "#eef3f8" : "#ffffff", "#cfd8e3");
      doc
        .font(rowIndex === 0 ? "Helvetica-Bold" : "Helvetica")
        .fontSize(8)
        .fillColor(rowIndex === 0 ? "#0a2947" : "#172033")
        .text(cell || " ", x + 4, startY + 5, {
          width: columnWidth - 8,
          lineGap: 1,
        });
    });
    doc.y = startY + rowHeight;
  });
  doc.moveDown(0.7);
}

function renderMarkdown(doc, markdown) {
  const lines = markdown.split(/\r?\n/);
  let paragraph = [];
  let codeBlock = null;
  let table = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      writeParagraph(doc, paragraph.join(" "));
      paragraph = [];
    }
  };

  const flushTable = () => {
    if (table.length) {
      writeTable(doc, table);
      table = [];
    }
  };

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      flushParagraph();
      flushTable();
      if (codeBlock) {
        writeCodeBlock(doc, codeBlock);
        codeBlock = null;
      } else {
        codeBlock = [];
      }
      continue;
    }

    if (codeBlock) {
      codeBlock.push(line);
      continue;
    }

    if (/^\s*\|.+\|\s*$/.test(line)) {
      flushParagraph();
      table.push(line);
      continue;
    }

    flushTable();

    if (!line.trim()) {
      flushParagraph();
      continue;
    }

    if (/^#{1,6}\s+/.test(line)) {
      flushParagraph();
      writeHeading(doc, line);
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      flushParagraph();
      writeParagraph(doc, `- ${line.replace(/^\s*[-*]\s+/, "")}`, {
        after: 0.2,
      });
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      flushParagraph();
      writeParagraph(doc, line.trim(), { after: 0.2 });
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  flushTable();
  if (codeBlock) writeCodeBlock(doc, codeBlock);
}

async function generatePdf(name) {
  const mdPath = resolve(docsDir, `${name}.md`);
  const pdfPath = resolve(docsDir, `${name}.pdf`);
  const markdown = readFileSync(mdPath, "utf8");
  const output = createWriteStream(pdfPath);
  const doc = new PDFDocument({
    size: "A4",
    margins: {
      top: PAGE.margin,
      bottom: PAGE.margin,
      left: PAGE.margin,
      right: PAGE.margin,
    },
    info: {
      Title: name.replaceAll("_", " "),
      Author: "ProveIt",
    },
  });

  doc.pipe(output);
  renderMarkdown(doc, markdown);
  doc.end();
  await waitForFinish(output);
  console.log(`Generated ${pdfPath}`);
}

for (const docName of docs) {
  await generatePdf(docName);
}
