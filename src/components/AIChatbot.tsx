import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";

interface Message { sender: "user" | "bot"; text: string; }

export const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: "Xin chào! Mình là trợ lý ảo H&Q Store. Bạn cần mình tư vấn gì về sản phẩm hay chính sách của shop không?" }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setLoading(true);

    try {
        const BACKEND_URL = "https://hqbackend-production.up.railway.app/api/chatbot/ask";

      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      if (!response.ok) throw new Error("Backend error");
      const data = await response.json();
      setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { sender: "bot", text: "Hệ thống tư vấn đang bận một chút, bạn cần hỏi gì gấp cứ nhắn hotline của shop nhé!" }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="bg-black text-white p-4 rounded-full shadow-2xl relative cursor-pointer border-none"><MessageSquare size={24} /></button>
      )}
      {isOpen && (
        <div className="bg-white w-[90vw] sm:w-[360px] h-[450px] rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
          <div className="bg-black p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2"><Sparkles size={16} className="text-yellow-400" /><div><h4 className="font-bold text-xs m-0">Trợ lý ảo H&Q</h4></div></div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white bg-transparent border-none cursor-pointer"><X size={18} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 text-xs">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-3 py-2.5 rounded-xl ${msg.sender === "user" ? "bg-black text-white" : "bg-white text-gray-800 border"}`}>{msg.text}</div>
              </div>
            ))}
            {loading && <div className="text-gray-400 animate-pulse">Đang suy nghĩ...</div>}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSend} className="p-3 border-t flex gap-2 bg-white m-0">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Hỏi về đổi trả, giao hàng..." className="flex-1 bg-gray-50 border rounded-xl px-3 py-2 text-xs outline-none" />
            <button type="submit" className="bg-black text-white p-2 rounded-xl cursor-pointer border-none"><Send size={14} /></button>
          </form>
        </div>
      )}
    </div>
  );
};