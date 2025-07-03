// extractor/readability.ts
import axios from 'axios';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

export async function extractGenericContent(url: string) {
  try {
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0', // helps bypass basic bot blocks
      },
    });

    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    return {
      url,
      title: article?.title || '',
      content: article?.textContent || '',
    };
  } catch (err) {
    console.error('Error extracting content with Readability:', (err as Error).message);
    return {
      url,
      title: '',
      content: '',
      error: true,
    };
  }
}
