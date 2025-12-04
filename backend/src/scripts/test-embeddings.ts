import 'dotenv/config';
import { getEmbeddings } from '../common/services/embeddings/embeddings';

async function main() {
  const provider = (process.env.EMBEDDINGS_PROVIDER || 'xenova').toLowerCase();
  const sample = process.env.EMBEDDINGS_TEST_TEXT || 'Hello, this is a quick embedding sanity check.';
  const userId = 'test-user';

  try {
    const vec = await getEmbeddings(sample, userId);
    const length = (vec as any)?.length ?? 0;
    if (!length) {
      console.error(`[TEST][embeddings] FAILED: provider=${provider} returned empty vector`);
      process.exit(2);
    }
    console.log(`[TEST][embeddings] SUCCESS: provider=${provider} length=${length}`);
    process.exit(0);
  } catch (err: any) {
    console.error(`[TEST][embeddings] ERROR for provider=${provider}:`, err?.message || err);
    process.exit(1);
  }
}

main();


