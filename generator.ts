import { createHash } from "crypto";
import { TOPICS } from "./topics";
import type { Topic } from "./topics";
import type { OfficialLink } from "./topics/types";

export interface GeneratedArticle {
  fingerprint: string;
  topicId: string;
  category: string;
  title: string;
  intro: string;
  body: string;
  keywords: string[];
  imagePrompts: { article: string; sections: string[] };
}

export function todayKey(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Cairo" });
}

export function hashFingerprint(input: string): string {
  return createHash("sha256").update(input).digest("hex").slice(0, 40);
}

/** مولد أرقام شبه عشوائية حتمي من بذرة نصية */
function seededRng(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let state = h >>> 0 || 1;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function shuffle<T>(rng: () => number, arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function yearize(text: string): string {
  const year = new Date().toLocaleDateString("en-US", {
    timeZone: "Africa/Cairo",
    year: "numeric",
  });
  return text.replace(/2025/g, year);
}

function clampIntro(text: string): string {
  if (text.length <= 258) return text;
  const cut = text.slice(0, 258);
  const lastDot = Math.max(cut.lastIndexOf("."), cut.lastIndexOf("،"));
  return (lastDot > 120 ? cut.slice(0, lastDot + 1) : cut).trim();
}

const ADVISORIES = [
  "تنويه إرشادي: هذا المقال مادة إعلامية إرشادية لا تغني عن الاستعلام الرسمي؛ ننصح دائمًا بمراجعة الجهة المختصة عبر روابطها الرسمية قبل إتمام أي إجراء، وعدم الاعتماد على أي رسوم أو اشتراطات غير موثقة.",
  "تنويه إرشادي: الرسوم والمدد والاشتراطات الواردة قابلة للتحديث، فالاعتماد النهائي على الجداول والإعلانات المعلنة من الجهات الرسمية فقط، ويُرجى توخي الدقة قبل سداد أي مبالغ.",
  "تنويه إرشادي: حرصًا على حقوقك، احتفظ دائمًا بإيصالات ومستندات المعاملات، وإن لاحظت أي اشتراط غير موثق فاطلب سنده الرسمي أو توجه لأقرب جهة استعلام.",
  "تنويه إرشادي: المحتوى لأغراض إرشادية عامة، ولأي حالة خاصة يُنصح بالتوجه لمكتب خدمة العملاء أو الخط الساخن للجهة المعنية عبر قنواتها الرسمية المعلنة.",
];

function linkMarkdown(link: OfficialLink): string {
  return `[${link.label}](${link.url})`;
}

function padSection(topic: Topic, rng: () => number, link: OfficialLink): string {
  const kw = pick(rng, topic.keywords);
  const h2 = pick(rng, [
    `أسئلة شائعة حول ${topic.cat}`,
    `معلومات إضافية تهمك عن الخدمة`,
    `قبل أن تذهب: خلاصة سريعة`,
  ]);
  const para = `من الأسئلة المتكررة حول هذه الخدمة ما يخص المستندات والمدد وطرق الاستعلام وشروط الاستثناء، والجواب المختصر هو: ابدأ بالاستعلام الرسمي، وجهّز مستنداتك كاملة، ثم توجه للجهة المختصة في موعدها المعلن، مع الاحتفاظ بإيصالاتك ومتابعة حالة طلبك عبر القنوات المعلنة. وننصح عند البحث عن معلومات دقيقة بالاعتماد على المصادر الرسمية مثل ${linkMarkdown(link)} دون غيرها، ومراجعة أي اشتراطات جديدة قبل السفر أو قبل إتمام المعاملة. مفتاح البحث المقترح: ${kw}، وتذكّر أن الدقة في البيانات توفر عليك زيارات متكررة وتضمن حقك كاملًا دون لبس أو اجتهاد شخصي بعيد عن النص الرسمي.`;
  return `\n\n## ${h2}\n\n${para}`;
}

export function generateArticle(
  topic: Topic,
  dayKey: string,
  salt: string,
  attempt: number,
): GeneratedArticle {
  const rng = seededRng(`${dayKey}|${salt}|${topic.id}|${attempt}`);
  const title = yearize(pick(rng, topic.titles));
  const intro = clampIntro(yearize(pick(rng, topic.intros)));

  const linkPool = shuffle(rng, topic.links);
  const sections: string[] = [];
  topic.sections.forEach((sec, i) => {
    const link = linkPool[i % linkPool.length];
    const alt = linkPool[(i + 1) % linkPool.length];
    let para = pick(rng, sec.paras);
    para = para.replaceAll("{LINK}", linkMarkdown(link));
    para = para.replaceAll("{ALT}", linkMarkdown(alt));
    sections.push(`## ${pick(rng, sec.h2)}\n\n${para}`);
  });

  let body = sections.join("\n\n");
  const proseWords = () =>
    body
      .split(/\n\n+/)
      .filter((b) => !b.startsWith("## ") && !b.startsWith("> "))
      .join(" ")
      .split(/\s+/)
      .filter(Boolean).length;
  for (let pad = 0; pad < 6 && proseWords() < 450; pad++) {
    body += padSection(topic, rng, linkPool[pad % linkPool.length]);
  }

  const advisory = pick(rng, ADVISORIES);
  body += `\n\n> ⚠️ ${advisory}`;

  const imgArticle = pick(rng, topic.imgArticle);
  const imgSections = topic.sections.map((_, i) => {
    const variants = topic.imgSections[i];
    return variants ? pick(rng, variants) : imgArticle;
  });

  const fingerprint = hashFingerprint(`${topic.id}|${title}|${intro}|${dayKey}|${salt}|${attempt}`);

  return {
    fingerprint,
    topicId: topic.id,
    category: topic.cat,
    title,
    intro,
    body,
    keywords: topic.keywords,
    imagePrompts: { article: imgArticle, sections: imgSections },
  };
}

/**
 * توليد دفعة جديدة من 8 مقالات فريدة.
 * يضمن عدم التكرار عبر البصمة المخزنة في السجل والدفعة نفسها.
 */
export function generateBatch(
  dayKey: string,
  existingFingerprints: Set<string>,
  size = 8,
): GeneratedArticle[] {
  const salt = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const topics = shuffle(seededRng(`${dayKey}|${salt}`), TOPICS);
  const chosen = topics.slice(0, Math.min(size, topics.length));
  const batch: GeneratedArticle[] = [];
  const seen = new Set<string>();

  for (const topic of chosen) {
    let article: GeneratedArticle | null = null;
    for (let attempt = 0; attempt < 40; attempt++) {
      const candidate = generateArticle(topic, dayKey, salt, attempt);
      if (
        !existingFingerprints.has(candidate.fingerprint) &&
        !seen.has(candidate.fingerprint)
      ) {
        article = candidate;
        break;
      }
    }
    if (!article) {
      // احتياط أخير: أعد المحاولة بملح جديد تمامًا
      const fallbackSalt = Math.random().toString(36).slice(2) + Math.random().toString(36);
      article = generateArticle(topic, dayKey, fallbackSalt, 999);
    }
    seen.add(article.fingerprint);
    batch.push(article);
  }
  return batch;
}

export { TOPICS };
