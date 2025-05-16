import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getEmbedding } from './utils/embedder.js';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Such stores need better management!
let docs = [];
let vectors = [];

export async function loadDocuments() {
  const files = ['hr-faq.md'];
  for (const file of files) {
    const content = fs.readFileSync(path.join(__dirname, 'data', file), 'utf-8');
    const embedding = await getEmbedding(content);
    docs.push({ content, embedding });
    vectors.push(embedding);
  }
}

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai ** 2, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi ** 2, 0));
  return dot / (normA * normB);
}

export async function askQuestion(question) {
  const questionEmbedding = await getEmbedding(question);
  console.log('questionEmbedding', questionEmbedding);
  const similarities = docs.map(doc => cosineSimilarity(doc.embedding, questionEmbedding));
  const topDoc = docs[similarities.indexOf(Math.max(...similarities))].content;

  const prompt = `Answer the following based on this document:\n${topDoc}\n\nQuestion: ${question}`;
  const ollamaResponse = await runOllama(prompt);
  return ollamaResponse;
}

function runOllama(prompt) {
  return new Promise((resolve) => {
    const process = spawn('ollama', ['run', 'mistral'], { stdio: ['pipe', 'pipe', 'pipe'] });
    let result = '';
    process.stdout.on('data', (data) => {
      result += data.toString();
    });
    process.stdin.write(prompt + '\n');
    process.stdin.end();
    process.on('close', () => resolve(result.trim()));
  });
}