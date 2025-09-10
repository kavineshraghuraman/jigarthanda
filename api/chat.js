export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, language, image } = req.body;

  if (!message && !image) {
    return res.status(400).json({ error: "Message or image is required" });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Missing GEMINI_API_KEY in environment" });
  }

  try {
    const promptText = language === 'ta' 
      ? `பதிலைக் தமிழ் மொழியில் மட்டும் வழங்கவும். கேள்வி: ${message || ""}` 
      : message || "";

    const contents = [
      {
        parts: [
          { text: promptText }
        ]
      }
    ];

    // Attach image if exists
    if (image) {
      contents[0].image = { imageBytes: image };
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({ contents })
      }
    );

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); }
    catch (err) {
      return res.status(500).json({
        error: "Gemini API did not return valid JSON",
        rawResponse: text
      });
    }

    if (data.error) return res.status(500).json({ error: data.error.message });

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                  (language === "ta" ? "மன்னிக்கவும், பதிலை பெற முடியவில்லை." : "Sorry, I couldn’t generate a reply.");

    res.status(200).json({ reply });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: err.message });
  }
}
