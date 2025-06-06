/**
 * HTML Site Configurations for Article Scraping
 * =============================================
 * 
 * This file contains site-specific configurations for HTML scraping.
 * Each configuration is tested and verified to work with the target website.
 * 
 * To add a new site:
 * 1. Use the test-html-scraper.js script to analyze the site structure
 * 2. Identify the correct selectors for containers, titles, descriptions, dates
 * 3. Add a new configuration entry below
 * 4. Test thoroughly before deploying
 */

export interface HTMLSiteConfig {
  domain: string
  containerSelector: string
  titleSelector?: string
  descriptionSelector?: string
  dateSelector?: string
  linkSelector?: string
  filters: {
    minTitleLength: number
    maxTitleLength: number
    excludeTitles: string[]
  }
}

/**
 * Site-specific configurations
 * Each entry corresponds to a tested and working configuration
 */
export const HTML_SITE_CONFIGURATIONS: HTMLSiteConfig[] = [
  {
    domain: 'anthropic.com',
    containerSelector: '.PostCard_post-card__z_Sqq',
    titleSelector: '', // Extract from link text (container is the link)
    descriptionSelector: 'p, [class*="excerpt"]',
    dateSelector: '.PostCard_post-timestamp__etH9K',
    linkSelector: '', // Container itself is the link
    filters: {
      minTitleLength: 10,
      maxTitleLength: 200,
      excludeTitles: ['Newsroom', 'News', 'Announcements', 'Featured']
    }
  },
  {
    domain: 'elevenlabs.io',
    containerSelector: 'article', // Found 11 article elements that worked well
    titleSelector: 'h2', // All titles were in h2 tags with class "f-heading-04" or "f-heading-05"
    descriptionSelector: 'p', // Descriptions found in p tags
    dateSelector: 'time', // Perfect - has datetime attribute and proper text
    linkSelector: 'a[href*="/blog/"]', // Links to blog posts
    filters: {
      minTitleLength: 10,
      maxTitleLength: 200,
      excludeTitles: ['Blog', 'Resources']
    }
  }
  // Add more site configurations here as they are tested
]

/**
 * Get configuration for a specific domain
 * @param url - The full URL to get configuration for
 * @returns Site configuration or null if not found
 */
export function getSiteConfig(url: string): HTMLSiteConfig | null {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    
    // Remove 'www.' prefix for matching
    const cleanHostname = hostname.replace(/^www\./, '')
    
    // Find matching configuration
    for (const config of HTML_SITE_CONFIGURATIONS) {
      if (cleanHostname.includes(config.domain)) {
        return config
      }
    }
    
    return null
  } catch {
    console.error('Invalid URL provided to getSiteConfig:', url)
    return null
  }
}

/**
 * Get list of all supported domains
 * @returns Array of supported domain names
 */
export function getSupportedDomains(): string[] {
  return HTML_SITE_CONFIGURATIONS.map(config => config.domain)
}

/**
 * Check if a domain is supported for HTML scraping
 * @param url - The URL to check
 * @returns True if the domain has a configuration
 */
export function isDomainSupported(url: string): boolean {
  return getSiteConfig(url) !== null
}