// pages/api/chat.js
export default async function handler(req, res) {
  try {
    const userMessage = req.body.message; // نص المستخدم

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.OPENROUTER_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free", // نموذج مجاني
        messages: [
          { role: "user", content: userMessage }
        ]
      })
    });

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error connecting to OpenRouter API" });
  }
}
