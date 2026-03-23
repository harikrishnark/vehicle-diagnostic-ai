# 🤖 Vehicle Diagnostic AI Assistant

A full-stack **Generative AI assistant** for vehicle diagnostics, built with a Python FastAPI backend and a Next.js frontend. Uses a custom **Retrieval-Augmented Generation (RAG)** pipeline to provide context-aware, real-time diagnostic support from automotive technical documents.

---

## 🏗️ Architecture

```
┌──────────────────────┐    HTTP     ┌────────────────────────────────────────────────┐
│  Next.js Frontend    │ ──────────► │  FastAPI Backend                               │
│  (Chat UI)           │ ◄────────── │  RAG Pipeline: ChromaDB + LangChain + OpenAI   │
└──────────────────────┘             └────────────────────────────────────────────────┘
                                                      │
                                              ┌───────▼────────┐
                                              │  Vehicle Manual │
                                              │  (ChromaDB      │
                                              │  vector store)  │
                                              └────────────────┘
```

---

## ✨ Features

- **Natural Language Diagnostics:** Ask questions like *"My DPF warning light is on, what should I do?"*
- **RAG Pipeline:** Vehicle manual content is chunked, embedded, and stored in ChromaDB for precise context retrieval
- **OpenAI Integration:** Responses are generated with full manual context injected, ensuring accurate answers
- **BMW iDrive-Inspired UI:** Sleek dark dashboard interface built with Next.js and Tailwind CSS

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, Tailwind CSS, TypeScript |
| Backend | Python, FastAPI, LangChain |
| Vector DB | ChromaDB |
| Embeddings | Sentence Transformers |
| AI Model | OpenAI GPT |

---

## 🚀 Running Locally

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Enter your OpenAI API key and start chatting!

---

## 📁 Project Structure

```
vehicle-diagnostic-ai/
├── backend/
│   ├── main.py               # FastAPI app + RAG pipeline
│   ├── requirements.txt
│   └── data/
│       └── vehicle_manual.txt
└── frontend/
    ├── src/app/
    │   └── page.tsx          # Main chat interface
    └── package.json
```

---

## 👨‍💻 Author

**Harikrishna Raj** — BSc Computer Science, BSBI Berlin  
[LinkedIn](https://linkedin.com/in/harikrishnark) · [GitHub](https://github.com/harikrishnark)
