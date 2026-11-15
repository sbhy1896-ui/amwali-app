import type { ArticleDTO } from "./dto";

export function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob(["\ufeff" + content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function articleToMarkdown(a: ArticleDTO): string {
  const prompts = [
    `برومبت صورة المقال (4:3): ${a.imagePrompts.article}`,
    ...a.imagePrompts.sections.map(
      (p, i) => `برومبت صورة القسم ${i + 1} (4:3): ${p}`,
    ),
  ].join("\n");
  return [
    `# ${a.title}`,
    "",
    `**التصنيف:** ${a.category}`,
    "",
    `**المقدمة:** ${a.intro}`,
    "",
    a.body,
    "",
    `**الكلمات المفتاحية:** ${a.keywords.join("، ")}`,
    "",
    `**برومبتات الصور (4:3):**`,
    prompts,
    "",
    `---`,
    `المقال من: مساعد مقالات أموالي | التصنيف: ${a.category}`,
  ].join("\n");
}

export function articleToText(a: ArticleDTO): string {
  return articleToMarkdown(a)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$1 ($2)")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/^###? /gm, "")
    .replace(/^> /gm, "");
}

export function downloadArticle(a: ArticleDTO, format: "md" | "txt" | "doc") {
  const base = `amwal-article-${a.id}`;
  if (format === "md") {
    downloadBlob(`${base}.md`, articleToMarkdown(a), "text/markdown");
  } else if (format === "txt") {
    downloadBlob(`${base}.txt`, articleToText(a), "text/plain");
  } else {
    downloadBlob(`${base}.doc`, articleToHtmlDoc(a), "application/msword");
  }
}

function mdInlineToHtml(text: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return esc(text).replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2">$1</a>',
  );
}

function articleToHtmlDoc(a: ArticleDTO): string {
  const blocks = a.body.split(/\n\n+/).map((b) => {
    if (b.startsWith("## ")) return `<h2>${mdInlineToHtml(b.slice(3))}</h2>`;
    if (b.startsWith("> ")) {
      return `<p style="background:#f3f4f6;border-right:4px solid #d9a441;padding:12px 16px;border-radius:8px">${mdInlineToHtml(b.slice(2))}</p>`;
    }
    return `<p>${mdInlineToHtml(b).replace(/\n/g, "<br/>")}</p>`;
  }).join("\n");

  const prompts = [
    `<li><b>صورة المقال (4:3):</b> ${a.imagePrompts.article}</li>`,
    ...a.imagePrompts.sections.map(
      (p, i) => `<li><b>صورة القسم ${i + 1} (4:3):</b> ${p}</li>`,
    ),
  ].join("");

  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8"/>
<title>${a.title}</title>
<style>body{font-family:'Traditional Arabic','Segoe UI',Tahoma,sans-serif;line-height:1.9;color:#1f2937;max-width:820px;margin:0 auto;padding:32px}h1{color:#065f46;font-size:26px}h2{color:#047857;margin-top:28px;border-bottom:2px solid #e5e7eb;padding-bottom:6px}p{font-size:16px}a{color:#0d9488}.kw{background:#ecfdf5;border:1px solid #a7f3d0;border-radius:999px;padding:4px 12px;display:inline-block;margin:3px}</style>
</head><body>
<h1>${a.title}</h1>
<p><b>التصنيف:</b> ${a.category}</p>
<p style="background:#ecfdf5;padding:12px 16px;border-radius:10px"><b>المقدمة:</b> ${a.intro}</p>
${blocks}
<p><b>الكلمات المفتاحية:</b><br/>${a.keywords.map((k) => `<span class="kw">${k}</span>`).join("")}</p>
<p><b>برومبتات الصور (4:3):</b></p><ul>${prompts}</ul>
<hr/><p style="color:#6b7280;font-size:13px">المقال من: مساعد مقالات أموالي | التصنيف: ${a.category}</p>
</body></html>`;
}

export function batchToHtmlDoc(
  articles: ArticleDTO[],
  dayKey: string,
  batchNo: number,
): string {
  const dateLabel = new Date(dayKey + "T12:00:00").toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const sections = articles
    .map((a, i) => {
      const blocks = a.body.split(/\n\n+/).map((b) => {
        if (b.startsWith("## ")) return `<h2>${mdInlineToHtml(b.slice(3))}</h2>`;
        if (b.startsWith("> ")) {
          return `<p style="background:#f3f4f6;border-right:4px solid #d9a441;padding:12px 16px;border-radius:8px">${mdInlineToHtml(b.slice(2))}</p>`;
        }
        return `<p>${mdInlineToHtml(b).replace(/\n/g, "<br/>")}</p>`;
      }).join("\n");
      const prompts = [
        `<li><b>صورة المقال (4:3):</b> ${a.imagePrompts.article}</li>`,
        ...a.imagePrompts.sections.map(
          (p, j) => `<li><b>صورة القسم ${j + 1} (4:3):</b> ${p}</li>`,
        ),
      ].join("");
      return `<article style="page-break-inside:avoid;margin-bottom:40px">
<h1 style="font-size:22px;color:#065f46">${i + 1}. ${a.title}</h1>
<p><b>التصنيف:</b> ${a.category}</p>
<p style="background:#ecfdf5;padding:12px 16px;border-radius:10px"><b>المقدمة:</b> ${a.intro}</p>
${blocks}
<p><b>الكلمات المفتاحية:</b> ${a.keywords.map((k) => `<span style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:999px;padding:2px 10px;font-size:13px">${k}</span>`).join(" ")}</p>
<p><b>برومبتات الصور (4:3):</b></p><ul>${prompts}</ul>
</article>`;
    })
    .join("\n");

  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8"/>
<title>مساعد مقالات أموالي — ${dateLabel} — دفعة ${batchNo}</title>
<style>body{font-family:'Traditional Arabic','Segoe UI',Tahoma,sans-serif;line-height:1.9;color:#1f2937;max-width:860px;margin:0 auto;padding:36px}h1{color:#065f46}h2{color:#047857;margin-top:26px;border-bottom:2px solid #e5e7eb;padding-bottom:6px}p{font-size:16px}a{color:#0d9488}</style>
</head><body>
<header style="text-align:center;border-bottom:3px solid #065f46;padding-bottom:20px;margin-bottom:32px">
<h1 style="margin:0">مساعد مقالات أموالي</h1>
<p style="color:#6b7280;margin:6px 0">الدفعة رقم ${batchNo} — ${dateLabel} — ٨ مقالات جديدة</p>
</header>
${sections}
</body></html>`;
}

export function downloadBatch(
  articles: ArticleDTO[],
  dayKey: string,
  batchNo: number,
) {
  downloadBlob(
    `amwal-articles-${dayKey}-batch${batchNo}.doc`,
    batchToHtmlDoc(articles, dayKey, batchNo),
    "application/msword",
  );
}
