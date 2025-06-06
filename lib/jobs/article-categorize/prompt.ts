import { NEWS_CATEGORY_CRITERIA, TECH_CATEGORY_CRITERIA, NEWS_CATEGORIES, TECH_CATEGORIES } from '../../constants/categories/index'

export function buildBatchCategorizationPrompt(articles: Array<{
  _id: string;
  title: string;
  metaDescription?: string;
  sourceName: string;
}>): string {
  const articlesText = articles.map((article, index) => 
    `Article ${index + 1} (ID: ${article._id}):
Title: "${article.title}"
Description: "${article.metaDescription || 'No description'}"
Source: ${article.sourceName}`
  ).join('\n\n');

  // Build news category criteria from constants
  const newsCriteriaText = Object.entries(NEWS_CATEGORY_CRITERIA)
    .map(([category, criteria], index) => {
      return `${index + 1}. **${category}:**
   * ${criteria.nature}
   * Keywords: ${criteria.keywords.map(k => `"${k}"`).join(', ')}
   * Content: ${criteria.content}`
    }).join('\n\n');

  // Build tech category criteria from constants
  const techCriteriaText = Object.entries(TECH_CATEGORY_CRITERIA)
    .map(([category, description], index) => {
      return `${index + 1}. **${category}:** ${description}`
    }).join('\n');

  // Create example with first categories for structure
  const exampleNewsCategory = NEWS_CATEGORIES[0];
  const exampleTechCategory = TECH_CATEGORIES[0];

  return `Please categorize the following ${articles.length} articles. You must assign exactly one NEWS category and one TECH category to each article.

${articlesText}

## NEWS CATEGORY CRITERIA:

${newsCriteriaText}

## TECH CATEGORY CRITERIA:

${techCriteriaText}

Return a JSON object with this exact structure:
{
  "articles": [
    {
      "id": "article_id_here",
      "newsCategory": "${exampleNewsCategory}",
      "techCategory": "${exampleTechCategory}",
      "rationale": "Brief explanation of categorization decision",
      "confidence": 85
    }
  ]
}

IMPORTANT: 
- Each article must have exactly one newsCategory and one techCategory
- Use these exact newsCategory options: ${NEWS_CATEGORIES.map(cat => `"${cat}"`).join(', ')}
- Use these exact techCategory options: ${TECH_CATEGORIES.map(cat => `"${cat}"`).join(', ')}
- Confidence should be 0-100
- Return results for all articles in the same order provided`;
}