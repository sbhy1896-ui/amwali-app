export interface ArticleDTO {
  id: number;
  generationId: number;
  fingerprint: string;
  topicId: string;
  category: string;
  title: string;
  intro: string;
  body: string;
  keywords: string[];
  imagePrompts: { article: string; sections: string[] };
  createdAt: string;
}

export interface GenerationDTO {
  id: number;
  dayKey: string;
  batchNo: number;
  createdAt: string;
  articleCount?: number;
}

export interface BatchResponse {
  ok: boolean;
  dayKey: string;
  batchNo: number;
  generationId: number;
  createdAt: string;
  articles: ArticleDTO[];
}

export interface HistoryResponse {
  ok: boolean;
  generations: GenerationDTO[];
}

export interface GenerationDetailResponse {
  ok: boolean;
  generation: GenerationDTO;
  articles: ArticleDTO[];
}

export interface FixResponse {
  ok: boolean;
  paragraph: string;
  links: { label: string; url: string }[];
  keywords: string[];
  topicId: string | null;
  topicCat: string | null;
}
