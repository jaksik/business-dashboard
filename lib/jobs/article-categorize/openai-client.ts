import OpenAI from 'openai'
import { buildBatchCategorizationPrompt } from './prompt'
import { NewsCategory, TechCategory } from '../../constants/categories/index'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export interface CategoryResult {
  id: string
  newsCategory: NewsCategory
  techCategory: TechCategory
  rationale: string
  confidence: number
}

export interface OpenAIUsageData {
  promptTokens: number
  completionTokens: number
  totalTokens: number
  modelUsed: string
}

export async function categorizeArticlesBatch(articles: Array<{
  _id: string;
  title: string;
  metaDescription?: string;
  sourceName: string;
}>): Promise<{ results: CategoryResult[], usage: OpenAIUsageData }> {
  const prompt = buildBatchCategorizationPrompt(articles);
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an expert article categorization assistant. Return only valid JSON.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.1,
    response_format: { type: "json_object" }
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  // Extract usage data
  const usage: OpenAIUsageData = {
    promptTokens: completion.usage?.prompt_tokens || 0,
    completionTokens: completion.usage?.completion_tokens || 0,
    totalTokens: completion.usage?.total_tokens || 0,
    modelUsed: 'gpt-4o-mini'
  }

  try {
    const result = JSON.parse(content);
    return { 
      results: result.articles,
      usage 
    };
  } catch (error) {
    throw new Error(`Failed to parse OpenAI response: ${error}`);
  }
}