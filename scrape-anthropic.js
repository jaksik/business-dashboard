const cheerio = require('cheerio');

async function scrapeAnthropicNews() {
  try {
    // Fetch the news page
    const response = await fetch('https://www.anthropic.com/news');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const articles = [];
    
    // Try different selector patterns for Anthropic's news page
    const selectors = [
      // Common news/blog selectors
      '.news-item, .article-item, .post-item',
      '[class*="news"], [class*="article"], [class*="post"]',
      '.grid > div, .list > div, .content > div',
      // Generic content containers
      'main div, section div, article',
      // Links that might be article titles
      'a[href*="/news/"], a[href*="news"]'
    ];
    
    for (const selector of selectors) {
      $(selector).each((index, element) => {
        const $element = $(element);
        
        // Skip if this element is too small (likely not an article)
        if ($element.text().trim().length < 20) return;
        
        // Try to find title
        let title = $element.find('h1, h2, h3, h4, h5, h6').first().text().trim();
        if (!title) {
          title = $element.find('a').first().text().trim();
        }
        if (!title) {
          title = $element.find('[class*="title"], [class*="heading"]').first().text().trim();
        }
        
        // Skip common navigation items
        if (!title || title.length < 5 || 
            ['Newsroom', 'News', 'Home', 'About', 'Contact'].includes(title)) {
          return;
        }
        
        // Try to find description
        let description = $element.find('p').first().text().trim();
        if (!description) {
          description = $element.find('[class*="description"], [class*="excerpt"], [class*="summary"]').first().text().trim();
        }
        
        // Try to find date
        let publishedDate = $element.find('time').first().text().trim();
        if (!publishedDate) {
          publishedDate = $element.find('time').first().attr('datetime');
        }
        if (!publishedDate) {
          publishedDate = $element.find('[class*="date"]').first().text().trim();
        }
        
        // Check if we already have this article (avoid duplicates)
        const exists = articles.some(article => article.title === title);
        if (!exists && title) {
          articles.push({
            title,
            description: description || 'No description available',
            publishedDate: publishedDate || 'Date not available'
          });
        }
      });
      
      // If we found articles, break out of the loop
      if (articles.length > 1) break;
    }
    
    // If still no luck, try a more aggressive approach
    if (articles.length <= 1) {
      console.log('Trying alternative approach...');
      
      // Look for any links that might be news articles
      $('a').each((index, element) => {
        const $link = $(element);
        const href = $link.attr('href');
        const title = $link.text().trim();
        
        // Check if this looks like a news article link
        if (href && (href.includes('/news/') || href.includes('news')) && 
            title && title.length > 10 && title.length < 200) {
          
          const $parent = $link.closest('div, article, section, li');
          const description = $parent.find('p').not($link).first().text().trim();
          const publishedDate = $parent.find('time, [class*="date"]').first().text().trim();
          
          const exists = articles.some(article => article.title === title);
          if (!exists) {
            articles.push({
              title,
              description: description || 'No description available',
              publishedDate: publishedDate || 'Date not available'
            });
          }
        }
      });
    }
    
    // Remove duplicates and filter out navigation items
    const filteredArticles = articles.filter((article, index, self) => 
      index === self.findIndex(a => a.title === article.title) &&
      !['Newsroom', 'News', 'Home', 'About'].includes(article.title)
    );
    
    // Output the results as JSON
    console.log(JSON.stringify(filteredArticles, null, 2));
    
    if (filteredArticles.length === 0) {
      console.log('No articles found. The website might be using JavaScript to load content.');
      console.log('\nHTML structure preview:');
      console.log($('body').html().substring(0, 1000) + '...');
    }
    
  } catch (error) {
    console.error('Error scraping Anthropic news:', error.message);
  }
}

// Run the scraper
scrapeAnthropicNews();