const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define Article schema directly
const articleSchema = new mongoose.Schema({
  title: String,
  link: String,
  sourceName: String,
  publishedDate: Date,
  metaDescription: String,
  fetchedAt: Date,
  categorization: {
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    categories: {
      news: String,
      tech: String
    },
    rationale: String,
    categorizedAt: Date,
    isTrainingData: { type: Boolean, default: false }
  }
});

const Article = mongoose.model('Article', articleSchema);

async function checkArticles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const totalArticles = await Article.countDocuments();
    const uncategorized = await Article.countDocuments({ 'categorization.status': 'pending' });
    const completed = await Article.countDocuments({ 'categorization.status': 'completed' });
    const trainingData = await Article.countDocuments({ 'categorization.isTrainingData': true });
    
    console.log('Database Articles Summary:');
    console.log('Total articles:', totalArticles);
    console.log('Uncategorized (pending):', uncategorized);
    console.log('Completed:', completed);
    console.log('Training data:', trainingData);
    
    // Get a few sample uncategorized articles
    const sampleArticles = await Article.find({ 'categorization.status': 'pending' }).limit(3);
    console.log('\nSample uncategorized articles:');
    sampleArticles.forEach(article => {
      console.log('-', article.title, '(', article.sourceName, ')');
    });
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkArticles();
