import axios from "axios";

export default async function extractContentWithMicrolink(url: string) {
  const res = await axios.get(`https://api.microlink.io?url=${encodeURIComponent(url)}&audio=true&video=true&meta=true`);
  const { data } = res;

  if (data.status === 'success') {
    return {
      title: data.data.title,
      description: data.data.description,
      content: data.data.textContent || data.data.description || '',
      image: data.data.image?.url,
      publisher: data.data.publisher,
    };
  }

  throw new Error('Failed to extract content');
}
