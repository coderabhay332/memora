import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function extractMedium(link: string): Promise<string> {
  try {
    const { data: html } = await axios.get(link, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const $ = cheerio.load(html);
    const article = $('article');

    if (!article.length) return 'No article content found.';

    const content: string[] = [];

    article.find('h1, h2, h3, p, li, pre, code').each((_, el) => {
      const tag = $(el).get(0)?.tagName;
      let text = $(el).text().trim();

      if (!text || text.length < 5) return;

      if (tag === 'h1') text = `\n\n# ${text}`;
      else if (tag === 'h2') text = `\n\n## ${text}`;
      else if (tag === 'h3') text = `\n\n### ${text}`;
      else if (tag === 'li') text = `- ${text}`;
      else if (tag === 'pre' || tag === 'code') text = `\n\n\`\`\`\n${text}\n\`\`\``;

      content.push(text);
    });

    return content.join('\n\n');
  } catch (error: any) {
    console.error(`Error scraping Medium: ${error.message}`);
    return 'Error extracting content';
  }
}
