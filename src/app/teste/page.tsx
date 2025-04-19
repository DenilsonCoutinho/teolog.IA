"use client"
import { useState } from "react";

export default function ChatScreen() {
  const [messages, setMessages] = useState<
    { role: "user" | "bot"; content: string }[]
  >([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setMessages((prev) => [
      { role: "user", content: input },
      { role: "bot", content: "Essa é uma resposta automática 😄" },
      { role: "bot", content: "Essa é uma resposta automática 😄" },
      { role: "bot", content: "Essa é uma resposta automática 😄" },
      { role: "bot", content: "Essa é uma resposta automática 😄" },
      { role: "bot", content: "Essa é uma resposta automática 😄" },
      { role: "bot", content: "Essa é uma resposta automática 😄" },
      { role: "bot", content: "Essa é uma resposta automática 😄" },
      { role: "bot", content: "Essa é uma resposta automática 😄" },
      { role: "bot", content: "Essa é uma resposta automática 😄" },
      { role: "bot", content: "Essa é uma resposta automática 😄" },
      { role: "bot", content: "Essa é uma resposta automática 😄" },
      { role: "bot", content: "Essa é uma resposta automática 😄" },
      { role: "bot", content: "Essa é uma resposta automática 😄" },
      { role: "bot", content: "Essa é uma resposta automática 😄" },
      { role: "bot", content: "Essa é uma resposta automática 😄" },
      { role: "bot", content: "Essa é uma resposta automática 😄" },
      { role: "bot", content: "Essa é uma resposta automática 😄" },
      { role: "bot", content: "Essa é uma resposta automática 😄" },
      { role: "bot", content: "Essa é uma resposta automática 😄" },
      { role: "bot", content: "Essa é uma resposta automática 😄" },
      { role: "bot", content: "Essa é uma resposta automática 😄" },
      { role: "bot", content: "Essa é uma resposta automática 😄" },
      { role: "bot", content: "Essa é uma resposta automática 😄" },
      { role: "bot", content: "Essa é uma resposta automática 😄" },
      { role: "bot", content: "Essa é uma resposta automática 😄" },
      { role: "bot", content: "Essa é uma resposta automática 😄" },
      { role: "bot", content: "Essa é uma resposta automática 😄" },
      { role: "bot", content: "Essa é uma resposta automática 😄" },
      { role: "bot", content: "Essa é uma resposta automática 😄" },
      { role: "bot", content: "Essa é uma resposta automática 😄" },
      { role: "bot", content: "Essa é uma resposta automática 😄" },
      { role: "bot", content: "Essa é uma resposta automática 😄" },
    ]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Conteúdo principal */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-center">
            <p className="text-lg">Comece uma conversa...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-xl p-3 rounded-xl ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white self-end ml-auto"
                    : "bg-white text-gray-800 self-start mr-auto border"
                }`}
              >
                {msg.content}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
