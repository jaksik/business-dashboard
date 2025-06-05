// Central export point for all database models
export { default as Article, type IArticle } from './Article';
export { default as Source, type ISource } from './Source';

// Re-export all models in a single object for convenience
import Article from './Article';
import Source from './Source';

export const models = {
  Article,
  Source,
};

export default models;
