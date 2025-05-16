import express from 'express';
import bodyParser from 'body-parser';
import { askQuestion, loadDocuments } from './rag.js';

const app = express();
app.use(bodyParser.json());

let isReady = false;

app.post('/chat', async (req, res) => {
  if (!isReady) return res.status(503).send('System is still loading documents.');
  const { question } = req.body;
  const answer = await askQuestion(question);
  res.json({ answer });
});

app.listen(3000, async () => {
  console.log('Server started on http://localhost:3000');
  await loadDocuments();
  isReady = true;
  console.log('Documents loaded and embeddings ready.');
});