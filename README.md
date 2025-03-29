# YouTube Super Thanks Scraper

CAUTION - This is just for fun and is an vibe coded script, it has been tested and works well, but its still vibe coded, so use with caution as there are no best practices in this 😁

A JavaScript tool to calculate how much a YouTube video has earned through Super Thanks comments.

## Overview

The YouTube Super Thanks Scraper is a browser console script that analyzes a YouTube video's comments to identify Super Thanks (paid comments) and calculate the total revenue generated from them. It works by scrolling through all comments on a video and identifying the special elements that YouTube uses to display paid comments.

## Features

- Automatically scrolls through all comments to ensure complete data collection
- Detects Super Thanks comments and extracts payment amounts
- Supports multiple currencies (USD, EUR, GBP, CAD, AUD, INR, etc.)
- Calculates total revenue by currency
- Provides detailed information about each Super Thanks comment
- Exports results as JSON for further analysis

## Usage

1. **Navigate to a YouTube video** with Super Thanks comments
2. **Open your browser's developer console**:
   - Chrome/Edge: Press F12 or Ctrl+Shift+J (Cmd+Option+J on Mac)
   - Firefox: Press F12 or Ctrl+Shift+K (Cmd+Option+K on Mac)
3. **Copy and paste the entire script** into the console
4. **Press Enter to run** the script
5. **Wait for the analysis to complete** (scrolling may take some time on videos with many comments)
6. **Export the results** using the provided commands:
   ```javascript
   // Export detailed data only
   copy(JSON.stringify(window.lastResults.detailedData, null, 2))
   
   // Export complete results with totals
   copy(JSON.stringify(window.lastResults, null, 2))
   ```

## How It Works

1. The script identifies YouTube's HTML structure for Super Thanks comments, specifically looking for:
   - `ytd-comment-view-model` elements with visible `yt-pdg-comment-chip-renderer` components
   - The `#comment-chip-price` element containing the donation amount

2. It scrolls through the page to ensure all comments are loaded, using a progressive scrolling technique with intelligent detection to determine when all comments have been loaded.

3. Once scrolling is complete, it analyzes all Super Thanks comments, calculating totals by currency and storing detailed information about each comment.

## Sample Results

The script produces results in this format:

```json
{
  "paidCommentsCount": 12,
  "totals": {
    "USD": 120.00,
    "EUR": 50.00
  },
  "detailedData": [
    {
      "index": 1,
      "author": "User123",
      "amount": "$10.00",
      "parsedAmount": 10,
      "currency": "USD"
    },
    // More entries...
  ],
  "metadata": {
    "videoUrl": "https://www.youtube.com/watch?v=...",
    "videoTitle": "Video Title",
    "videoId": "...",
    "timestamp": "2025-03-29T12:34:56.789Z",
    "totalComments": 542
  }
}
```

## Limitations

- The script can only analyze comments that are loaded in the browser
- YouTube may not load all comments for extremely popular videos
- Currency conversion is not performed (totals are kept separate by currency)
- Accuracy depends on YouTube's HTML structure remaining consistent

## Browser Compatibility

Tested and working on:
- Google Chrome
- Mozilla Firefox
- Microsoft Edge

## License

MIT License - Feel free to use, modify, and distribute as needed.

## Disclaimer

This script is for educational purposes only. It only accesses publicly visible information that anyone can see when browsing YouTube. Use responsibly and respect YouTube's terms of service.
