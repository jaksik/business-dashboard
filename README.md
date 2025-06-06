curl -X POST http://localhost:3000/api/jobs/categorize-articles \
  -H "Content-Type: application/json" \
  -d '{
    "articleCount": 10,
    "batchSize": 10
  }'


  import { NEWS_CATEGORY_CRITERIA, TECH_CATEGORY_CRITERIA } from '../../constants/categories/index'

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

  return `Please categorize the following ${articles.length} articles. You must assign exactly one NEWS category and one TECH category to each article.

${articlesText}

## NEWS CATEGORY CRITERIA:

1. **Top Story Candidate:**
   * Major, impactful news. High signal, low noise.
   * Keywords: "New model released," "launches," "unveils," "breakthrough," "major partnership," "acquires," "significant funding ($50M+)," "new GPU/hardware," "foundational model," "open source."
   * Content: Announcements of new AI products, services, significant model versions, major research papers with clear breakthroughs, or high-impact business news.

2. **Solid News:**
   * Important and factual updates, but perhaps not groundbreaking enough for a top headline.
   * Keywords: "Updates," "enhances," "new feature," "integrates," "expands," "study shows," "report finds," "secures funding"
   * Content: Significant updates to existing AI tools/platforms, new noteworthy features, interesting case studies with concrete results, well-supported industry reports.

3. **Interesting but Lower Priority:**
   * Potentially interesting but more niche or less broadly impactful.
   * Keywords: "Tips for," "explores," "discusses," "community project," vision pieces, conceptual discussions.
   * Content: Niche tool releases, specific tutorials, community news, smaller research findings, thoughtful perspectives, platform insights.

4. **Likely Noise or Opinion:**
   * Content that is not direct news or is overly speculative/opinion-based.
   * Keywords: "Opinion:","Perspective:","How to survive," "The future of X is Y (speculative)", "Is AI X?", "Why I think Y," event announcements, tips collections.
   * Content: Opinion pieces, guest posts, highly speculative articles, basic explainers, marketing content, fear-mongering, generic "AI trend" pieces, event promotion.

## TECH CATEGORY CRITERIA:

1. **Products and Updates:** New AI products, major feature releases, significant model launches, hardware announcements
2. **Developer Tools:** APIs, frameworks, coding tools, SDKs, development platforms, technical utilities
3. **Research and Innovation:** Research papers, academic breakthroughs, novel techniques, experimental findings, scientific studies
4. **Industry Trends:** Market analysis, business trends, adoption studies, industry reports, strategic insights, company shifts
5. **Startups and Funding:** Investment news, startup announcements, funding rounds, acquisitions, business developments
6. **Not Relevant:** Non-tech content, general news, opinion pieces without technical substance, promotional material

Return a JSON object with this exact structure:
{
  "articles": [
    {
      "id": "article_id_here",
      "newsCategory": "Top Story Candidate",
      "techCategory": "Products and Updates",
      "rationale": "Brief explanation of categorization decision",
      "confidence": 85
    }
  ]
}

IMPORTANT: 
- Each article must have exactly one newsCategory and one techCategory
- Use the exact category names from the criteria above
- Confidence should be 0-100
- Return results for all articles in the same order provided`;
}