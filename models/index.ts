// Central export point for all database models
export { default as Article, type IArticle } from './Article';
export { default as Source, type ISource } from './Source';
export { default as ArticleFetchLog, type IArticleFetchLog } from './ArticleFetchLog';
export { default as ArticleCategorizationLog, type IArticleCategorizationLog } from './ArticleCategorizationLog';

// Re-export all models in a single object for convenience
import Article from './Article';
import Source from './Source';
import ArticleFetchLog from './ArticleFetchLog';
import ArticleCategorizationLog from './ArticleCategorizationLog';

export const models = {
  Article,
  Source,
  ArticleFetchLog,
  ArticleCategorizationLog,
};

export default models;
