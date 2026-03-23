import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# LangChain Imports for RAG Architecture
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings.sentence_transformer import SentenceTransformerEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_openai import ChatOpenAI
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

app = FastAPI(title="BMW Generative AI In-Car Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Provide a dummy API key if the user hasn't set one yet to prevent instant crashes
# Let the user know they need to set their actual key in the frontend chat.
OPENAI_KEY = os.getenv("OPENAI_API_KEY", "sk-placeholder-key") 

# --- RAG PIPELINE SETUP (Runs when server starts) ---

print("🧠 Initializing In-Car AI Brain...")

# 1. Load the Dummy BMW Manual
loader = TextLoader("./data/vehicle_manual.txt")
docs = loader.load()

# 2. Split it into readable "chunks" (paragraphs)
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
splits = text_splitter.split_documents(docs)

# 3. Create a Vector Database (Using a free local embedding model to save costs)
# This turns English sentences into mathematical vectors.
embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
vectorstore = Chroma.from_documents(documents=splits, embedding=embedding_function)
retriever = vectorstore.as_retriever()

# 4. Set the AI's Persona (System Prompt)
system_prompt = (
    "You are the official BMW In-Car AI Assistant. "
    "Use the provided context from the vehicle owner's manual to answer the driver's question. "
    "If you don't know the answer, tell them to consult a certified BMW Service Center. "
    "Always prioritize driver safety. Keep your answers concise, professional, and helpful.\n\n"
    "{context}"
)

prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", "{input}"),
])

# Define what data the frontend will send us
class ChatRequest(BaseModel):
    question: str
    api_key: str # The user will provide their key via the UI

@app.post("/ask")
async def ask_assistant(request: ChatRequest):
    """
    The frontend Next.js dashboard will send the driver's question here.
    """
    try:
        # Initialize the OpenAI model using the key provided by the user
        llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0, api_key=request.api_key)
        
        # Combine the Retriever (finding the manual) with the LLM (answering)
        question_answer_chain = create_stuff_documents_chain(llm, prompt)
        rag_chain = create_retrieval_chain(retriever, question_answer_chain)
        
        # Ask the question!
        response = rag_chain.invoke({"input": request.question})
        
        return {
            "status": "success", 
            "answer": response["answer"]
        }
    except Exception as e:
        print(f"Error communicating with AI: {e}")
        return {
            "status": "error",
            "answer": "Connection to the BMW Intelligence Network failed. Please ensure your API Key is correct."
        }

class ImageAnalysisRequest(BaseModel):
    image_base64: str
    api_key: str

@app.post("/analyze-image")
async def analyze_dashboard_image(request: ImageAnalysisRequest):
    """
    Mock endpoint for AR Image Analysis.
    In a real app, we would send the image to a Vision Model (like GPT-4o).
    Here, we mock detecting a 'DPF Failure' warning light and use RAG to explain it.
    """
    try:
        llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0, api_key=request.api_key)
        question_answer_chain = create_stuff_documents_chain(llm, prompt)
        rag_chain = create_retrieval_chain(retriever, question_answer_chain)
        
        # Simulate the Vision Model detecting a warning
        detected_issue = "DPF failure warning sign"
        
        # Ask RAG what to do about it based *only* on the BMW manual
        query = f"The driver reported a {detected_issue}."
        query += " What does it mean and what should they do? Give a concise 2-sentence answer."
        
        response = rag_chain.invoke({"input": query})
        
        return {
            "status": "success",
            "diagnosis": {
                "issue": "Diesel Particulate Filter (DPF) Warning",
                "severity": "Medium",
                "action": response["answer"],
                "code": "CC-ID 49"
            }
        }
    except Exception as e:
        print(f"Vision AI Error: {e}")
        return {
            "status": "error",
            "message": "Computer Vision module disconnected. Please check API Key."
        }
