"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, AlertCircle, Aperture, Sparkles } from "lucide-react";
import { useUI } from '@/lib/uiContext';

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showIdleMsg, setShowIdleMsg] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const lastMessageRef = useRef("");
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { isLightboxOpen } = useUI();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  // Idle message logic
  useEffect(() => {
    if (isOpen || hasInteracted) {
      setShowIdleMsg(false);
      return;
    }
    const timer = setTimeout(() => {
      setShowIdleMsg(true);
    }, 8000); // show after 8 seconds
    return () => clearTimeout(timer);
  }, [isOpen, hasInteracted]);

  if (isLightboxOpen) return null;

  function handleClose() {
    abortRef.current?.abort();
    setIsOpen(false);
  }

  function handleOpen() {
    setIsOpen(true);
    setHasInteracted(true);
  }

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return;
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    lastMessageRef.current = text;
    setInput("");
    setError("");
    setIsLoading(true);
    setHistory(prev => [...prev, { role: "user", content: text }]);
    
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Request failed");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let reply = "";

      setHistory(prev => [
        ...prev, { role: "assistant", content: "" }
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setHistory(prev => [
          ...prev.slice(0, -1),
          { role: "assistant", content: reply }
        ]);
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError("Could not get a response.");
      setHistory(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }

  const suggested = [
    "What photography trend should I follow in 2026?",
    "How do I shoot like a cinematographer?",
    "Tell me about Jay's visual style"
  ];

  return (
    <>
      {/* Idle Tooltip */}
      <AnimatePresence>
        {!isOpen && showIdleMsg && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className="fixed bottom-9 right-24 z-[89] bg-white text-black px-4 py-2.5 rounded-2xl rounded-br-sm shadow-[0_8px_30px_rgb(0,0,0,0.2)] text-sm font-medium whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors flex items-center gap-2"
            onClick={handleOpen}
          >
            <Sparkles className="w-4 h-4 text-accent" />
            Let's talk photography!
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleOpen}
            className="fixed bottom-6 right-6 z-[90] w-14 h-14 rounded-full bg-accent text-black shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center transition-transform group overflow-hidden"
          >
            {/* The creative animated logo */}
            <Aperture size={28} className="absolute transition-transform duration-[3000ms] ease-linear group-hover:rotate-180" />
            <div className="absolute w-full h-full rounded-full border-[3px] border-black/10 scale-90" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-[90] w-80 h-[480px] md:w-96 md:h-[520px] bg-card/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-card/80 border-b border-white/10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <h3 className="font-serif text-white text-sm">Jay's Studio</h3>
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar flex flex-col relative">
              {history.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${msg.role === "user" ? "bg-accent/20 text-white rounded-tr-sm ml-auto" : "bg-white/5 text-gray-300 rounded-tl-sm mr-auto"} rounded-2xl px-4 py-2 text-sm max-w-[85%] break-words`}
                >
                  {msg.content}
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 text-gray-300 rounded-2xl rounded-tl-sm px-4 py-3 mr-auto max-w-[85%] flex items-center gap-1"
                >
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-white/40"
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </motion.div>
              )}

              {error && (
                <div className="text-red-400/70 text-xs flex flex-col items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{error}</span>
                  </div>
                  <button
                    onClick={() => sendMessage(lastMessageRef.current)}
                    className="underline hover:text-red-400"
                  >
                    Retry
                  </button>
                </div>
              )}

              {history.length === 0 && !isLoading && !error && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-4 flex flex-col items-center">
                  <p className="text-gray-500 text-xs text-center mb-3">Ask me anything about photography</p>
                  <div className="flex flex-col gap-2 items-center w-full">
                    {suggested.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(q)}
                        className="px-3 py-1.5 rounded-full text-xs bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 transition-colors text-center w-full max-w-[90%]"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} className="h-1" />
            </div>

            {/* Input */}
            <div className="border-t border-white/10 p-3 bg-black/20 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Ask about photography..."
                maxLength={500}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={isLoading || !input.trim()}
                className="p-2 text-gray-400 hover:text-accent disabled:opacity-50 disabled:hover:text-gray-400 transition-colors flex items-center justify-center shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
