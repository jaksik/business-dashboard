export function buildCategorizationPrompt(
  title: string, 
  description: string, 
  sourceName: string
): string {
  return `
You are an expert news categorizer. Analyze this article and categorize it appropriately.

ARTICLE DETAILS:
Title: "${title}"
Description: "${description}"
Source: "${sourceName}"

CATEGORIES (choose the most relevant ones):
- news: General news categories (Politics, World, Sports, Entertainment, Health, etc.)
- tech: Technology categories (AI, Software, Hardware, Startups, etc.)  
- business: Business categories (Finance, Markets, Economy, Companies, etc.)
- science: Science categories (Research, Medicine, Space, Environment, etc.)

INSTRUCTIONS:
1. Only assign categories that clearly fit the article content
2. Be specific with subcategories (e.g., "Artificial Intelligence" not just "Technology")
3. Maximum 2-3 categories total
4. Provide confidence score (0-100)
5. Explain your reasoning briefly

RESPOND WITH VALID JSON:
{
  "categories": {
    "news": "specific category or null",
    "tech": "specific category or null", 
    "business": "specific category or null",
    "science": "specific category or null"
  },
  "rationale": "Brief explanation of categorization decision",
  "confidence": 85
}
`
}