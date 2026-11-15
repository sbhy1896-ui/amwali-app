export interface OfficialLink {
  label: string;
  url: string;
}

export interface TopicSection {
  /** صيغ بديلة للعنوان الفرعي H2 */
  h2: string[];
  /** فقرات بديلة — قد تحتوي على {LINK} لموضع رابط رسمي */
  paras: string[];
}

export interface Topic {
  id: string;
  /** التصنيف */
  cat: string;
  /** صيغ بديلة للعنوان الرئيسي */
  titles: string[];
  /** مقدمات قصيرة (أقل من 260 حرفاً) */
  intros: string[];
  /** 5 كلمات مفتاحية أساسية */
  keywords: string[];
  /** 6 أقسام H2 على الأقل */
  sections: TopicSection[];
  /** روابط حكومية رسمية */
  links: OfficialLink[];
  /** برومبتات صورة المقال (4:3) */
  imgArticle: string[];
  /** برومبت صورة لكل قسم H2 */
  imgSections: string[][];
}
