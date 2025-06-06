const cheerio = require('cheerio');

async function analyzeWebsite(url) {
  console.log(`🔍 Analyzing: ${url}`);
  console.log('='.repeat(60));
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Remove script and style tags for cleaner analysis
    $('script, style').remove();
    
    console.log('📊 BASIC INFO:');
    console.log(`Title: ${$('title').text()}`);
    console.log(`Domain: ${new URL(url).hostname}`);
    console.log('');
    
    // Analyze potential article containers
    console.log('📦 POTENTIAL ARTICLE CONTAINERS:');
    analyzeContainers($);
    
    console.log('📰 POTENTIAL ARTICLE ELEMENTS:');
    analyzeArticleElements($);
    
    console.log('🔗 LINKS ANALYSIS:');
    analyzeLinks($, url);
    
    console.log('📅 DATE ELEMENTS:');
    analyzeDateElements($);
    
    // Try to find actual articles using common patterns
    console.log('🎯 ARTICLE EXTRACTION TEST:');
    testArticleExtraction($, url);
    
    // NEW: Specific test for Anthropic structure
    console.log('🎯 ANTHROPIC SPECIFIC TEST:');
    testAnthropicStructure($, url);
    
  } catch (error) {
    console.error('❌ Error analyzing website:', error.message);
  }
}

function analyzeContainers($) {
  const containerSelectors = [
    'article', '.article', '.post', '.news-item', '.blog-post',
    '[class*="article"]', '[class*="post"]', '[class*="news"]', '[class*="blog"]',
    '.grid > div', '.list > div', 'main > div', '.content > div',
    // Add specific selectors we found
    '.PostCard_post-card__z_Sqq', '[class*="PostCard"]'
  ];
  
  containerSelectors.forEach(selector => {
    const elements = $(selector);
    if (elements.length > 0) {
      console.log(`  ${selector}: ${elements.length} elements`);
      
      // Show first few classes for context
      elements.slice(0, 3).each((i, el) => {
        const classes = $(el).attr('class') || 'no-class';
        const textPreview = $(el).text().trim().substring(0, 100);
        console.log(`    [${i}] classes: "${classes}"`);
        console.log(`        text: "${textPreview}..."`);
      });
    }
  });
}

function analyzeArticleElements($) {
  console.log('  Headlines (h1-h6):');
  $('h1, h2, h3, h4, h5, h6').slice(0, 10).each((i, el) => {
    const tag = el.tagName.toLowerCase();
    const text = $(el).text().trim();
    const classes = $(el).attr('class') || 'no-class';
    if (text.length > 10 && text.length < 200) {
      console.log(`    ${tag}: "${text}" (class: "${classes}")`);
    }
  });
  
  console.log('  Paragraphs (potential descriptions):');
  $('p').slice(0, 5).each((i, el) => {
    const text = $(el).text().trim();
    const classes = $(el).attr('class') || 'no-class';
    if (text.length > 20 && text.length < 300) {
      console.log(`    p: "${text.substring(0, 100)}..." (class: "${classes}")`);
    }
  });
}

function analyzeLinks($, baseUrl) {
  const hostname = new URL(baseUrl).hostname;
  const internalLinks = [];
  
  $('a[href]').each((i, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().trim();
    
    if (href && text && text.length > 10 && text.length < 200) {
      // Check if it's an internal link that might be an article
      if (href.startsWith('/') || href.includes(hostname)) {
        if (href.includes('/blog/') || href.includes('/news/') || 
            href.includes('/article/') || href.includes('/post/')) {
          internalLinks.push({ href, text, classes: $(el).attr('class') || 'no-class' });
        }
      }
    }
  });
  
  console.log(`  Found ${internalLinks.length} potential article links:`);
  internalLinks.slice(0, 5).forEach(link => {
    console.log(`    "${link.text}" -> ${link.href} (class: "${link.classes}")`);
  });
}

function analyzeDateElements($) {
  $('time, [datetime], [class*="date"], [class*="time"]').slice(0, 10).each((i, el) => {
    const text = $(el).text().trim();
    const datetime = $(el).attr('datetime');
    const classes = $(el).attr('class') || 'no-class';
    
    console.log(`    ${el.tagName.toLowerCase()}: "${text}" datetime="${datetime}" (class: "${classes}")`);
  });
}

function testArticleExtraction($, baseUrl) {
  // Try to extract articles using multiple strategies
  const strategies = [
    {
      name: 'Article tags',
      container: 'article',
      title: 'h1, h2, h3',
      description: 'p',
      date: 'time, [class*="date"]'
    },
    {
      name: 'Class-based (article)',
      container: '[class*="article"], [class*="post"]',
      title: 'h1, h2, h3, h4',
      description: 'p',
      date: 'time, [class*="date"]'
    },
    {
      name: 'Grid/List items',
      container: '.grid > div, .list > div',
      title: 'h1, h2, h3, h4, a',
      description: 'p',
      date: 'time, [class*="date"]'
    }
  ];
  
  strategies.forEach(strategy => {
    console.log(`\n  Testing strategy: ${strategy.name}`);
    const containers = $(strategy.container);
    console.log(`    Found ${containers.length} containers`);
    
    let articlesFound = 0;
    containers.slice(0, 5).each((i, container) => {
      const $container = $(container);
      const title = $container.find(strategy.title).first().text().trim();
      const description = $container.find(strategy.description).first().text().trim();
      const date = $container.find(strategy.date).first().text().trim();
      
      if (title && title.length > 10) {
        articlesFound++;
        console.log(`    [${i}] Title: "${title.substring(0, 60)}..."`);
        console.log(`        Desc: "${description.substring(0, 80)}..."`);
        console.log(`        Date: "${date}"`);
      }
    });
    
    console.log(`    -> Found ${articlesFound} potential articles`);
  });
}

// NEW: Test Anthropic's specific structure
function testAnthropicStructure($, baseUrl) {
  console.log('Testing Anthropic PostCard structure...');
  
  // Target the specific post card class we identified
  const postCards = $('.PostCard_post-card__z_Sqq');
  console.log(`Found ${postCards.length} PostCard elements`);
  
  const articles = [];
  
  postCards.each((i, card) => {
    if (i >= 10) return false; // Limit to first 10 for testing
    
    const $card = $(card);
    
    // The entire card is usually a link, get the href and text
    const href = $card.attr('href');
    const fullText = $card.text().trim();
    
    // Try to extract date (it's usually at the end)
    const dateElement = $card.find('.PostCard_post-timestamp__etH9K, [class*="timestamp"], [class*="date"]').first();
    const date = dateElement.text().trim();
    
    // Extract title by removing the date from the full text
    let title = fullText;
    if (date && title.includes(date)) {
      title = title.replace(date, '').trim();
    }
    
    // Remove common prefixes like "Announcements", "Featured", etc.
    title = title.replace(/^(Announcements|Featured|Research|Blog)\s*/, '');
    
    // Look for description/excerpt within the card
    const description = $card.find('p, [class*="excerpt"], [class*="description"]').first().text().trim();
    
    if (title && title.length > 10 && href) {
      articles.push({
        title: title.substring(0, 100), // Limit for display
        description: description || 'No description found',
        date: date || 'No date found',
        link: href,
        fullText: fullText.substring(0, 150) + '...'
      });
    }
  });
  
  console.log(`\nExtracted ${articles.length} articles:`);
  articles.forEach((article, i) => {
    console.log(`\n  [${i}] Title: "${article.title}"`);
    console.log(`      Date: "${article.date}"`);
    console.log(`      Link: "${article.link}"`);
    console.log(`      Desc: "${article.description}"`);
    console.log(`      Full: "${article.fullText}"`);
  });
  
  // Generate the configuration based on findings
  console.log('\n🔧 SUGGESTED CONFIGURATION:');
  console.log(`{
    domain: 'anthropic.com',
    containerSelector: '.PostCard_post-card__z_Sqq',
    titleSelector: '', // Extract from link text
    descriptionSelector: 'p, [class*="excerpt"]',
    dateSelector: '.PostCard_post-timestamp__etH9K',
    linkSelector: '', // Container itself is the link
    filters: {
      minTitleLength: 10,
      maxTitleLength: 200,
      excludeTitles: ['Newsroom', 'News', 'Anthropic', 'Announcements', 'Featured']
    }
  }`);
}

// Test multiple websites
async function testMultipleSites() {
  const sites = [
    'https://elevenlabs.io/blog',
    'https://www.anthropic.com/news',
    // Add more sites to test
  ];
  
  for (const site of sites) {
    await analyzeWebsite(site);
    console.log('\n' + '='.repeat(80) + '\n');
  }
}

// Run the analysis
if (process.argv.length > 2) {
  // Test specific URL from command line
  analyzeWebsite(process.argv[2]);
} else {
  // Test predefined sites
  testMultipleSites();
}