export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, language } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Missing GEMINI_API_KEY in environment" });
  }

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY,
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

    // read raw text first to avoid JSON parse errors
    const text = await response.text();
    let data;

    try {
      data = JSON.parse(text); // try parsing JSON
    } catch (err) {
      console.error("Failed to parse JSON from Gemini:", text);
      return res.status(500).json({
        error: "Gemini API did not return valid JSON",
        rawResponse: text,
      });
    }

    // check if Gemini returned an error
    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    // extract reply
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      (language === "ta"
        ? "மன்னிக்கவும், பதிலை பெற முடியவில்லை."
        : "Sorry, I couldn’t generate a reply.");

    res.status(200).json({ reply });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: err.message });
  }
}
