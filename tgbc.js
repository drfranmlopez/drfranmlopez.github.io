// Update TGBC book of the month

const fs = require('fs');
const path = require('path');

async function updateBook() {
  try {
    console.log('Fetching Tough Guy Book Club site...');
    const response = await fetch('https://www.toughguybookclub.com/books');
    const html = await response.text();

    // Look for headings on the books page where selections are rendered
    const regex = /<h[23][^>]*>(.*?)<\/h[23]>/gi;
    let match;
    let foundBook = null;

    while ((match = regex.exec(html)) !== null) {
      const text = match[1].replace(/<[^>]*>/g, '').trim();
      // Identify book titles by looking for standard formatting (containing a dash or a year like 2026)
      if (text.length > 3 && (text.includes('-') || /\(\d{4}\)/.test(text))) {
        if (!text.toLowerCase().includes('tough guy') && !text.toLowerCase().includes('latest books')) {
          foundBook = text;
          break;
        }
      }
    }

    if (!foundBook) {
      throw new Error('Could not parse the current book title from the HTML structure.');
    }

    console.log('Found current book:', foundBook);

    const data = {
      raw: foundBook,
      updatedAt: new Date().toISOString()
    };

    const filePath = path.join(__dirname, './tgbc.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log('Successfully updated current-book.json');
  } catch (error) {
    console.error('Error updating book:', error);
    process.exit(1);
  }
}

updateBook();