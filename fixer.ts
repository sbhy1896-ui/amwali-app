import { TOPICS } from "./topics";
import type { OfficialLink } from "./topics/types";

export interface FixResult {
  paragraph: string;
  links: OfficialLink[];
  keywords: string[];
  topicId: string | null;
  topicCat: string | null;
}

const GENERIC_LINKS: OfficialLink[] = [
  { label: "البوابة الإلكترونية للخدمات الحكومية", url: "https://www.gov.eg" },
  { label: "بوابة مصر الرقمية", url: "https://www.digital.gov.eg" },
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .trim();
}

function detectTopic(objection: string): { topicId: string | null; topicCat: string | null; score: number } {
  const norm = normalize(objection);
  let best: { topicId: string | null; topicCat: string | null; score: number } = {
    topicId: null,
    topicCat: null,
    score: 0,
  };
  for (const topic of TOPICS) {
    let score = 0;
    for (const kw of topic.keywords) {
      if (norm.includes(normalize(kw))) score += 3;
    }
    const catNorm = normalize(topic.cat);
    if (norm.includes(catNorm)) score += 2;
    if (norm.includes(normalize(topic.id.replace(/_/g, " ")))) score += 2;
    if (score > best.score) {
      best = { topicId: topic.id, topicCat: topic.cat, score };
    }
  }
  return best.score > 0 ? best : { topicId: null, topicCat: null, score: 0 };
}

function cleanObjection(objection: string): string {
  const trimmed = objection.trim();
  if (trimmed.length <= 180) return trimmed;
  return trimmed.slice(0, 180) + "…";
}

export function fixObjection(objection: string): FixResult {
  const detected = detectTopic(objection);
  const topic = TOPICS.find((t) => t.id === detected.topicId) ?? null;
  const links = topic ? topic.links.slice(0, 2) : GENERIC_LINKS;
  const keywords = topic ? topic.keywords.slice(0, 5) : ["خدمات حكومية", "إجراءات رسمية", "استعلام إلكتروني", "مستندات رسمية", "خدمات مصر الرقمية"];
  const echo = cleanObjection(objection);
  const scope = detected.topicCat ?? "هذه الخدمة";

  const l1 = `[${links[0].label}](${links[0].url})`;
  const l2 = links[1] ? `[${links[1].label}](${links[1].url})` : null;

  const variants = [
    `نص بديل مقترح: تعقيبًا على ما أثير في المراجعة بشأن «${echo}»، يُعاد الصياغة كالتالي: تُدار هذه الخدمة ضمن منظومة «${scope}» وفق الضوابط الرسمية المعمول بها، وعلى مقدم الطلب استيفاء المستندات المعلنة من الجهة المختصة قبل إتمام الإجراء، دون الاعتماد على أي رسوم أو اشتراطات غير موثقة؛ ويُستند في ذلك إلى المصادر الرسمية المتمثلة في ${l1}${l2 ? ` و${l2}` : ""}، مع التنويه بأن هذه المعلومات إرشادية وقابلة للتحديث حسب آخر إعلانات الجهة.`,

    `نص بديل مقترح: في ضوء ملاحظة المراجعة بخصوص «${echo}»، نقترح الصياغة الموضعية التالية: تخضع المعاملة لضوابط «${scope}» المعلنة من الجهات الرسمية، ويُرجى من القارئ مراجعة الاشتراطات والمدد عبر ${l1}${l2 ? ` أو ${l2}` : ""} قبل التقدم بطلب، مع عدم ذكر أي مبالغ أو رسوم غير واردة في الجداول الرسمية، والإشارة إلى أن المحتوى إرشادي لا يغني عن الاستعلام المباشر.`,

    `نص بديل مقترح: إشارة إلى اعتراض المراجعة حول «${echo}»، يُستبدل النص محل الملاحظة بما يلي: تُنجز هذه المعاملة من خلال المسار الرسمي المعتمد في ${l1}${l2 ? ` و${l2}` : ""}، ويُنصح بالتحقق من أحدث المستندات والمدد قبل البدء، مع الالتزام بعدم تداول أي رسوم غير موثقة أو معلومات غير صادرة عن الجهة، والتنويه بأن ما سبق معلومات إرشادية عامة قابلة للتحديث.`,
  ];

  const seed = Date.now().toString(36) + Math.random().toString(36).slice(2);
  const idx = Math.abs([...seed].reduce((a, c) => a + c.charCodeAt(0), 0)) % variants.length;

  return {
    paragraph: variants[idx],
    links,
    keywords,
    topicId: detected.topicId,
    topicCat: detected.topicCat,
  };
}
