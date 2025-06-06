const cheerio = require('cheerio');

async function scrapeElevenLabsBlog() {
  try {
    // Fetch the blog page
    const response = await fetch('https://elevenlabs.io/blog');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const articles = [];
    
    // Select article elements - adjust selectors based on actual HTML structure
    $('article, .blog-post, [data-testid*="blog"], .post-item').each((index, element) => {
      const $article = $(element);
      
      // Try different selector patterns for title
      let title = $article.find('h1, h2, h3, .title, [class*="title"], [class*="heading"]').first().text().trim();
      
      // Try different selector patterns for description
      let description = $article.find('p, .description, .excerpt, [class*="description"], [class*="excerpt"]').first().text().trim();
      
      // Try different selector patterns for date
      let publishedDate = $article.find('time, .date, [class*="date"], [datetime]').first().text().trim();
      
      // If no date found in text, try datetime attribute
      if (!publishedDate) {
        publishedDate = $article.find('time, [datetime]').first().attr('datetime') || '';
      }
      
      // Only add articles that have at least a title
      if (title) {
        articles.push({
          title,
          description: description || 'No description available',
          publishedDate: publishedDate || 'Date not available'
        });
      }
    });
    
    // If no articles found with the above selectors, try more generic approach
    if (articles.length === 0) {
      $('a[href*="/blog/"], a[href*="blog"]').each((index, element) => {
        const $link = $(element);
        const title = $link.text().trim();
        
        if (title && title.length > 10) { // Filter out short navigation text
          const $parent = $link.closest('div, article, section');
          const description = $parent.find('p').not($link).first().text().trim();
          const publishedDate = $parent.find('time, .date, [class*="date"]').first().text().trim();
          
          articles.push({
            title,
            description: description || 'No description available',
            publishedDate: publishedDate || 'Date not available'
          });
        }
      });
    }
    
    // Output the results as JSON
    console.log(JSON.stringify(articles, null, 2));
    
    if (articles.length === 0) {
      console.log('No articles found. The website structure may have changed.');
      console.log('HTML structure preview:');
      console.log($('body').html().substring(0, 500) + '...');
    }
    
  } catch (error) {
    console.error('Error scraping ElevenLabs blog:', error.message);
  }
}

// Run the scraper
scrapeElevenLabsBlog();