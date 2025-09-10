export default async function handler(req, res) {
  console.log("Incoming request:", req.body);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, language } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY, // ✅ Correct way
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    language === "ta"
                      ? `பதிலைக் தமிழ் மொழியில் மட்டும் வழங்கவும். கேள்வி: ${message}`
                      : message,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    console.log("Gemini raw response:", data);

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      (language === "ta"
        ? "மன்னிக்கவும், பதிலை பெற முடியவில்லை."
        : "Sorry, I couldn’t generate a reply.");

    res.status(200).json({ reply });
  } catch (err) {
    console.error("Se
