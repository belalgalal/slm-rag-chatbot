import { pipeline } from '@xenova/transformers';

let embedder = null;

// Load the embedding pipeline once (this may take a few seconds)
export async function getEmbedding(text) {
  if (!embedder) {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }

  const output = await embedder(text, {
    pooling: 'mean',  // average the tokens
    normalize: true   // cosine similarity ready
  });

  return Array.from(output.data);
}
