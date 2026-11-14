const fs = require('fs');
const path = require('path');

async function updateBook() {
  try {
    console.log('Fetching Tough Guy Book Club homepage...');
    const response = await fetch('https://www.toughguybookclub.com/');
    const html = await response.text();

    // Strip out script and style tags completely
    const cleanedHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

    // Isolate the "Latest Books" section on the homepage
    const latestBooksIndex = cleanedHtml.indexOf('Latest Books');
    let candidateBooks = [];

    if (latestBooksIndex !== -1) {
      // Grab a chunk of text following the "Latest Books" heading
      const sliceText = cleanedHtml.substring(latestBooksIndex, latestBooksIndex + 1500);
      const lines = sliceText.split('\n');
      
      for (const line of lines) {
        const text = line.replace(/<[^>]*>/g, '').trim();
        // Look for lines that look like books (contain a dash and a 4-digit year like 2026)
        if (text.length > 5 && text.includes('-') && /\(\d{4}\)/.test(text)) {
          // Exclude unwanted UI strings
          if (!text.toLowerCase().includes('tough guy') && !text.toLowerCase().includes('track your read')) {
            candidateBooks.push(text);
          }
        }
      }
    }

    // Fallback if the section index changed: scan all lines with strict rules
    if (candidateBooks.length === 0) {
      const lines = cleanedHtml.split('\n');
      for (const line of lines) {
        const text = line.replace(/<[^>]*>/g, '').trim();
        if (text.length > 5 && text.includes('-') && /\(\d{4}\)/.test(text)) {
          if (!text.toLowerCase().includes('tough guy') && !text.toLowerCase().includes('track your read')) {
            candidateBooks.push(text);
          }
        }
      }
    }

    const foundBook = candidateBooks[0];

    if (!foundBook) {
      throw new Error('Could not parse a valid book title from the page content.');
    }

    console.log('Found current book:', foundBook);

    const data = {
      raw: foundBook,
      updatedAt: new Date().toISOString()
    };

    const filePath = path.join(__dirname, 'tgbc.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log('Successfully updated current-book.json');
  } catch (error) {
    console.error('Error updating book:', error);
    process.exit(1);
  }
}

updateBook();