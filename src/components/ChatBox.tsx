import { useState } from "react";

export default function ChatBox() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  const handleSend = async () => {
    if (!input) return;

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "No response";
    setMessages([...messages, `User: ${input}`, `AI: ${reply}`]);
    setInput("");
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto" }}>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          minHeight: "200px",
          marginBottom: "10px",
        }}
      >
        {messages.map((m, idx) => (
          <div key={idx}>{m}</div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: "80%", padding: "5px" }}
      />
      <button onClick={handleSend} style={{ padding: "5px 10px" }}>
        Send
      </button>
    </div>
  );
}
