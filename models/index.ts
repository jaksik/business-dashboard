// Central export point for all database models
export { default as Article, type IArticle } from './Article';
export { default as Source, type ISource } from './Source';
export { default as ArticleFetchLog, type IArticleFetchLog } from './ArticleFetchLog';
export { default as ArticleCategorizationLog, type IArticleCategorizationLog } from './ArticleCategorizationLog';
export { default as CategoryCorrectionLog, type ICategoryCorrectionLog } from './CategoryCorrectionLog';

// Re-export all models in a single object for convenience
import Article from './Article';
import Source from './Source';
import ArticleFetchLog from './ArticleFetchLog';
import ArticleCategorizationLog from './ArticleCategorizationLog';
import CategoryCorrectionLog from './CategoryCorrectionLog';

export const models = {
  Article,
  Source,
  ArticleFetchLog,
  ArticleCategorizationLog,
  CategoryCorrectionLog,
};

export default models;
