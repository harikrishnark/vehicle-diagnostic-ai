"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Key, Bot, User, CarFront, Loader2 } from "lucide-react";

// Structure of a chat message
interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello. I am the BMW Intelligent Assistant. I have loaded the vehicle's manual. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(true);

  // Auto-scroll to bottom of chat
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (!apiKey.trim()) {
      alert("Please enter an OpenAI API Key first.");
      return;
    }

    const userMessage = input.trim();
    setInput("");
    
    // Add user message to UI immediately
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);

    try {
      // Send question and API key to our Python server
      const response = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userMessage,
          api_key: apiKey
        })
      });

      const data = await response.json();

      if (data.status === "success") {
        setMessages(prev => [...prev, { role: "assistant", content: data.answer }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: `Error: ${data.answer}` }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "System error: Could not reach the Cloud Data Hub." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 md:p-8">
      
      {/* Central "Infotainment" Screen Container */}
      <div className="glass-panel w-full max-w-4xl h-[85vh] rounded-2xl flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <header className="p-5 border-b border-gray-800/60 flex justify-between items-center bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,102,177,0.5)]">
              <CarFront className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-light tracking-wide text-white">Intelligent <span className="font-semibold text-blue-400">Assistant</span></h1>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-mono">BMW iDrive OS 9.0</p>
            </div>
          </div>
          
          {/* API Key Toggle/Input */}
          <div className="flex items-center gap-2">
            {showKeyInput ? (
              <input 
                type="password" 
                placeholder="sk-..." 
                className="bg-black/50 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors w-48"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            ) : null}
            <button 
              onClick={() => setShowKeyInput(!showKeyInput)}
              className={`p-2 rounded-lg transition-colors ${apiKey ? 'text-blue-400 bg-blue-900/20' : 'text-gray-400 hover:text-white bg-black/30'}`}
              title="Configure OpenAI API Key"
            >
              <Key className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Chat Message Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-gray-700' : 'bg-blue-600/20 border border-blue-500/30'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-gray-300" /> : <Bot className="w-4 h-4 text-blue-400" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-sm' 
                  : 'bg-black/40 border border-gray-800 text-gray-200 rounded-tl-sm leading-relaxed'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-4 flex-row">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-blue-400" />
              </div>
              <div className="bg-black/40 border border-gray-800 rounded-2xl rounded-tl-sm px-5 py-3 flex items-center gap-2 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" /> Processing query...
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-800/60 bg-black/30">
          <form onSubmit={handleSend} className="relative">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the vehicle a question..."
              className="w-full bg-black/50 border border-gray-700 rounded-xl pl-4 pr-12 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-light"
              disabled={isTyping}
            />
            <button 
              type="submit" 
              disabled={isTyping || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center text-blue-400 hover:bg-blue-500/10 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-gray-600 uppercase tracking-widest inline-block mx-auto">Powered by RAG Intelligence</span>
          </div>
        </div>

      </div>
    </main>
  );
}
