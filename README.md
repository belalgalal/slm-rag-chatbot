# SLM RAG Chatbot for (Node.js + Ollama + Local Embeddings)

It combines:
- 🧠 A local Small Language Model (e.g. Mistral via [Ollama](https://ollama.com))
- 🧮 Custom vector index for semantic similarity
- 📚 Local documents (no internet)
- 🧬 Real embeddings using [Xenova Transformers](https://xenova.github.io/transformers.js/)

---

## 📁 Project Structure

```
rag-chatbot-node-esm/
├── server.js              # Express API server
├── rag.js                 # Core RAG logic: similarity + prompt
├── utils/
│   └── embedder.js        # Embedding function (mocked or real)
├── data/
│   └── hr-faq.md          # Your HR documents
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Install Ollama

Install Ollama and pull a model like Mistral:

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull mistral
```

### 2. Install Node Modules

```bash
npm install
```

### 3. Start the Server

```bash
npm start
```

---

## 💬 Query the Chatbot

```bash
curl -X POST http://localhost:3000/chat \
  -H 'Content-Type: application/json' \
  -d '{"question": "How many vacation days do I have?"}' | jq
```

Output:
```json
{
   "answer": "You have 25 working days of paid vacation per year."
}
```

```bash
curl -X POST http://localhost:3000/chat \
  -H 'Content-Type: application/json' \
  -d '{"question": "Is there a dress code?"}' | jq
```

Output:
```json
{
   "answer": "Yes, there is a dress code. The company follows a smart casual dress code, except for formal client meetings."
}
```


---

## 🧠 How It Works

1. Loads and embeds HR documents on startup.
2. On each question:
   - Embeds the question.
   - Finds the most relevant doc using cosine similarity.
   - Builds a prompt: _“Answer the following based on this document...”_
   - Sends it to the local `mistral` model via Ollama.
   - Returns the model's answer.

---

## 🧰 Architecture Diagram

```ascii
                    ┌───────────────────────────────┐
                    │        User / Client          │
                    │   (asks HR-related question)  │
                    └──────────────┬────────────────┘
                                   │
                                   ▼
                    ┌───────────────────────────────┐
                    │         Express Server        │
                    │        /chat endpoint         │
                    └───────────────┬───────────────┘
                                    │
             ┌───────────────────────────────────────────────┐
             │         RAG Pipeline (rag.js functions)       │
             └───────────────────────────────────────────────┘
                                     │
      ┌──────────────────────────────┼────────────────────────────┐
      ▼                              ▼                            ▼
┌─────────────────────┐   ┌──────────────────────────────┐   ┌─────────────────────────────┐
│ getEmbedding(text)  │   │ cosineSimilarity(a, b)       │   │ runOllama(prompt)           │
│ (utils/embedder.js) │   │ Compares question/doc vectors│   │ Calls local LLM via CLI     │
└────────────┬────────┘   └──────────────┬───────────────┘   └──────────────┬──────────────┘
             │                           │                                  │
   ┌─────────▼─────────┐     ┌───────────▼─────────────┐       ┌────────────▼─────────────┐
   │ Embed question    │     │ Find top document       │       │ Prompt:                  │
   │ → questionVector  │     │ using similarity scoring│       │ "Answer based on..."     │
   └───────────────────┘     └─────────────────────────┘       └──────────────────────────┘
                                           │
                                           ▼
                              ┌────────────────────────────┐
                              │   Answer generated by LLM  │
                              └────────────────────────────┘
                                            │
                                            ▼
                            ┌────────────────────────────────┐
                            │   JSON response to the client  │
                            └────────────────────────────────┘

```

➡️ **RAG (Retrieval-Augmented Generation)**: Combines external context (retrieved documents) with LLMs to generate more accurate answers.

➡️ **Embedder / Sentence Transformer**: Converts text into numerical vectors that capture semantic meaning.

➡️ **Vectors**: Arrays of numbers used to represent text for comparison.

➡️ **Cosine Similarity**: Finds the most relevant document by comparing angles between vectors.

---

## 🧪 Tips

- Use `jq` for pretty-printing JSON responses.
- Extend `hr-faq.md` with your own company info.

---

## 📌 Notes

- Fully local: No internet access needed after pulling model.
- Ideal for internal or offline environments.

## 🔮 Future Improvements
- Dynamic Document Uploads: add an API to ingest new HR documents at runtime (live uploads).
- Persistent Vector Store: use a database like Qdrant or Weaviate to store vectors across restarts.
- Persistent Document Map: store the doc list in DB to store documents across restarts
- Frontend Chat UI: build a simple React-based interface for non-technical users.
- Multi-document Retrieval: Support retrieving and combining multiple relevant documents.
- Metadata Support: for example, tag documents with titles, authors, or departments for better filtering.
- Authentication: secure the API so only internal users can access it.
- Chat History: store past questions and answers for context or auditing.
- The sky is your limit!
