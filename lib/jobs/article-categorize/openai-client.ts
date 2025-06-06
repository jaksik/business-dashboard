import OpenAI from 'openai'
import { buildCategorizationPrompt } from './prompt'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export interface CategoryResult {
  categories: {
    news?: string
    tech?: string
    business?: string
    science?: string
  }
  rationale: string
  confidence: number
}

export async function categorizeArticle(
  title: string, 
  description: string, 
  sourceName: string
): Promise<CategoryResult> {
  const prompt = buildCategorizationPrompt(title, description, sourceName)
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Cost-effective for this task
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1, // Low temperature for consistent categorization
    response_format: { type: "json_object" }
  })

  return JSON.parse(response.choices[0].message.content!)
}