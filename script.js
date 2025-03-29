// YouTube Super Thanks Scraper
// This script scrolls through YouTube comments and calculates total revenue from Super Thanks
// Author: Based on YouTube comment HTML structure analysis
// Usage: Open a YouTube video, paste this script in browser console, and run it. Read README.md before running

// Store results globally
window.lastResults = null;

// Configuration
const config = {
  scrollDelay: 1000,        // Delay between scrolls in ms
  maxScrolls: 500,          // Maximum number of scroll operations
  scrollIncrement: 2000,    // Pixels to scroll each time
  stabilityThreshold: 5,    // Number of stable scrolls to confirm end
  commentSelector: 'ytd-comment-thread-renderer',
  paidCommentSelector: 'ytd-comment-view-model:has(yt-pdg-comment-chip-renderer:not([hidden]))',
  amountSelector: '#comment-chip-price',
  currency: {
    // Single character currency symbols
    '₹': 'INR', // Indian Rupee
    '$': 'USD', // US Dollar (default if not specified)
    '€': 'EUR', // Euro
    '£': 'GBP', // British Pound
    '¥': 'JPY', // Japanese Yen/Chinese Yuan
    '₩': 'KRW', // South Korean Won
    '₽': 'RUB', // Russian Ruble
    '₴': 'UAH', // Ukrainian Hryvnia
    '₺': 'TRY', // Turkish Lira
    '₱': 'PHP', // Philippine Peso
    '₫': 'VND', // Vietnamese Dong
    'R': 'ZAR', // South African Rand
    '฿': 'THB', // Thai Baht
    '₪': 'ILS', // Israeli New Shekel
    
    // Multi-character currency symbols
    'C$': 'CAD', // Canadian Dollar
    'A$': 'AUD', // Australian Dollar
    'NZ$': 'NZD', // New Zealand Dollar
    'HK$': 'HKD', // Hong Kong Dollar
    'S$': 'SGD', // Singapore Dollar
    'R$': 'BRL', // Brazilian Real
    'kr': 'SEK', // Swedish/Norwegian/Danish Krona
    'CHF': 'CHF', // Swiss Franc
    'zł': 'PLN', // Polish Złoty
    'Mex$': 'MXN', // Mexican Peso
    'RM': 'MYR', // Malaysian Ringgit
    'AED': 'AED', // United Arab Emirates Dirham
    'SAR': 'SAR', // Saudi Riyal
    'руб': 'RUB', // Russian Ruble (text)
    '₹': 'INR', // Indian Rupee
    '₩': 'KRW'  // Korean Won
  }
};

// Function to extract currency and amount from a price string
function extractAmount(priceString) {
  if (!priceString) return { currency: null, amount: 0 };
  
  // Handle special cases for multi-character currency symbols
  for (const [symbol, code] of Object.entries(config.currency)) {
    if (symbol.length > 1 && priceString.includes(symbol)) {
      const amountStr = priceString.replace(symbol, '').replace(/[^\d.]/g, '');
      const amount = parseFloat(amountStr);
      return { 
        currency: code, 
        amount: amount,
        original: priceString
      };
    }
  }
  
  // Handle single character currency symbols
  const currencySymbol = priceString.match(/[^\d.,\s]/)?.[0];
  const currencyCode = currencySymbol ? (config.currency[currencySymbol] || 'UNKNOWN') : 'UNKNOWN';
  
  // Extract numeric amount (removing currency symbol, commas, and spaces)
  const amountStr = priceString.replace(/[^\d.]/g, '');
  const amount = parseFloat(amountStr);
  
  return { 
    currency: currencyCode, 
    amount: amount,
    original: priceString
  };
}

// Function to scroll to bottom of page to load comments
async function scrollToLoadComments() {
  console.log('Starting aggressive scrolling to load all comments...');
  
  let previousHeight = 0;
  let scrollCount = 0;
  let stableScrolls = 0;
  let commentCount = 0;
  let previousCommentCount = 0;
  
  // Function to get current comments
  const getCurrentComments = () => document.querySelectorAll(config.commentSelector).length;
  
  while (scrollCount < config.maxScrolls) {
    // More aggressive scrolling - scroll by increment rather than to bottom
    const currentScroll = window.scrollY;
    window.scrollTo(0, currentScroll + config.scrollIncrement);
    
    // Every 5 scrolls, also scroll to absolute bottom to ensure we don't miss anything
    if (scrollCount % 5 === 0) {
      setTimeout(() => window.scrollTo(0, document.documentElement.scrollHeight), 300);
    }
    
    scrollCount++;
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, config.scrollDelay));
    
    // Check comments loaded
    commentCount = getCurrentComments();
    
    // Check if we've reached the end (page height and comment count haven't changed)
    const currentHeight = document.documentElement.scrollHeight;
    if (currentHeight === previousHeight && commentCount === previousCommentCount) {
      stableScrolls++;
      // If height and comment count haven't changed for several consecutive scrolls
      if (stableScrolls >= config.stabilityThreshold) {
        console.log(`Reached end of comments after ${scrollCount} scrolls`);
        break;
      }
    } else {
      stableScrolls = 0;
    }
    
    previousHeight = currentHeight;
    previousCommentCount = commentCount;
    
    // Log progress every 10 scrolls
    if (scrollCount % 10 === 0) {
      console.log(`Scrolled ${scrollCount} times, loaded ${commentCount} comments`);
    }
    
    // If we've scrolled 70% of max scrolls, try scrolling to absolute bottom to make sure
    if (scrollCount === Math.floor(config.maxScrolls * 0.7)) {
      console.log("Performing deep scroll to ensure all comments are loaded...");
      window.scrollTo(0, 999999); // Very large value to force scroll to bottom
      await new Promise(resolve => setTimeout(resolve, config.scrollDelay * 2));
    }
  }
  
  console.log(`Finished scrolling. Total scrolls: ${scrollCount}, Total comments loaded: ${commentCount}`);
}

// Function to analyze Super Thanks comments
function analyzeSuperThanks() {
  console.log('Analyzing Super Thanks comments...');
  
  // Get all paid comments
  const paidComments = document.querySelectorAll(config.paidCommentSelector);
  console.log(`Found ${paidComments.length} Super Thanks comments`);
  
  // Object to store totals by currency
  const totals = {};
  const detailedData = [];
  
  // Process each paid comment
  paidComments.forEach((comment, index) => {
    // Get the comment author
    const authorElement = comment.querySelector('#author-text');
    const author = authorElement ? authorElement.textContent.trim() : 'Unknown User';
    
    // Get the amount text
    const amountElement = comment.querySelector(config.amountSelector);
    const amountText = amountElement ? amountElement.textContent.trim() : '';
    
    // Extract the currency and amount
    const { currency, amount, original } = extractAmount(amountText);
    
    // Skip if invalid amount
    if (!currency || amount <= 0) return;
    
    // Add to totals
    if (!totals[currency]) {
      totals[currency] = 0;
    }
    totals[currency] += amount;
    
    // Store detailed info
    detailedData.push({
      index: index + 1,
      author,
      amount: original,
      parsedAmount: amount,
      currency
    });
    
    console.log(`${index + 1}. ${author}: ${original} (${amount} ${currency})`);
  });
  
  // Calculate grand total
  console.log('\nSuper Thanks Summary:');
  console.log('====================');
  Object.entries(totals).forEach(([currency, total]) => {
    console.log(`${currency}: ${total.toFixed(2)}`);
  });
  
  return {
    paidCommentsCount: paidComments.length,
    totals,
    detailedData
  };
}

// Main function to run the scraper
async function runSuperThanksScraper() {
  try {
    // Check if we're on a YouTube video page
    if (!window.location.href.includes('youtube.com/watch')) {
      console.error('This script should be run on a YouTube video page');
      return { error: 'Not a YouTube video page' };
    }
    
    console.log('Starting YouTube Super Thanks Scraper...');
    console.log(`Video URL: ${window.location.href}`);
    console.log(`Video Title: ${document.title.replace(' - YouTube', '')}`);
    
    // Scroll to load all comments
    await scrollToLoadComments();
    
    // Force one final scroll to bottom to make absolutely sure we've loaded everything
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise(resolve => setTimeout(resolve, config.scrollDelay * 2));
    
    // Analyze Super Thanks comments
    const results = analyzeSuperThanks();
    
    // Add metadata
    results.metadata = {
      videoUrl: window.location.href,
      videoTitle: document.title.replace(' - YouTube', ''),
      videoId: new URLSearchParams(window.location.search).get('v'),
      timestamp: new Date().toISOString(),
      totalComments: document.querySelectorAll(config.commentSelector).length
    };
    
    // Display summary
    console.log(`\nFound ${results.paidCommentsCount} Super Thanks comments`);
    if (results.paidCommentsCount > 0) {
      console.log(`Revenue by currency: ${Object.entries(results.totals).map(([currency, amount]) => 
        `${amount.toFixed(2)} ${currency}`).join(', ')}`);
    } else {
      console.log('No Super Thanks revenue found for this video.');
    }
    
    // Store results globally for easy access
    window.lastResults = results;
    
    // Provide export commands
    console.log('\n=== Data Export Commands ===');
    console.log('For detailed data: copy(JSON.stringify(window.lastResults.detailedData, null, 2))');
    console.log('For full results: copy(JSON.stringify(window.lastResults, null, 2))');
    
    // Note about accuracy
    console.log('\nNote: This is an estimation based on visible Super Thanks comments.');
    console.log('YouTube may hide some comments or not show all of them on very popular videos.');
    
    return results;
  } catch (error) {
    console.error('Error running Super Thanks scraper:', error);
    return { error: error.toString() };
  }
}

// Instructions
console.log(`
==================================================
YouTube Super Thanks Revenue Calculator
==================================================

This script will:
1. Scroll through the comments to load them all
2. Identify Super Thanks (paid) comments
3. Calculate total revenue by currency
4. Save detailed results for export

The results will be saved to 'window.lastResults'
After completion, you can export the data using the provided commands.

Starting now...
`);

// Run the scraper automatically
runSuperThanksScraper().then(results => {
  console.log('\nAnalysis complete!');
  
  if (results.error) {
    console.error('Error:', results.error);
    return;
  }
  
  console.log(`
==================================================
HOW TO SAVE THE RESULTS
==================================================
You can use one of these commands:

1. Get just the detailed data:
   copy(JSON.stringify(window.lastResults.detailedData, null, 2))

2. Get the full results with totals:
   copy(JSON.stringify(window.lastResults, null, 2))

This will copy the data to your clipboard, which you can then paste into a file.
`);
});

// Export functions for potential reuse
window.ytSuperThanksAnalyzer = {
  runAnalysis: runSuperThanksScraper,
  config: config
};
