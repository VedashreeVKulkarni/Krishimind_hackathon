import { useState } from "react";
import { sendChatMessage } from "../utils/api";

export default function ChatTab({ profile, activeCrop }) {

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {

    if (!message.trim()) return;

    const userMessage = message;

    setMessages(prev => [
      ...prev,
      { role: "user", text: userMessage }
    ]);

    setMessage("");
    setLoading(true);

    try {

      const res = await sendChatMessage({
        question: userMessage,
        crop: activeCrop.id,
        state: profile.state,
        district: profile.district
      });

      setMessages(prev => [
        ...prev,
        { role: "assistant", text: res.answer }
      ]);

    } catch (err) {

      setMessages(prev => [
        ...prev,
        { role: "assistant", text: "⚠️ AI service unavailable." }
      ]);

    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>

      <h2>🤖 KrishiMind AI Assistant</h2>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 10,
          padding: 15,
          height: 400,
          overflowY: "auto",
          marginBottom: 10
        }}
      >
        {messages.map((m, i) => (
          <div key={i}
            style={{
              textAlign: m.role === "user" ? "right" : "left",
              marginBottom: 10
            }}
          >
            <span
              style={{
                background: m.role === "user" ? "#daf5da" : "#f0f0f0",
                padding: "8px 12px",
                borderRadius: 10,
                display: "inline-block"
              }}
            >
              {m.text}
            </span>
          </div>
        ))}

        {loading && <div>AI thinking...</div>}
      </div>

      <div style={{ display: "flex", gap: 10 }}>

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about crop prices..."
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc"
          }}
        />

        <button
          onClick={handleSend}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            background: "#1b6b35",
            color: "white",
            border: "none"
          }}
        >
          Send
        </button>

      </div>
    </div>
  );
}