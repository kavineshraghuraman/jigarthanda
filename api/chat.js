export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, language, image } = req.body;

  if (!message && !image) {
    return res.status(400).json({ error: "Message or image is required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY not set" });

  try {
    const promptText = language === "ta"
      ? `பதிலைக் தமிழ் மொழியில் சுருக்கமாக மற்றும் மனிதனைப் போல அளிக்கவும்: ${message || ""}`
      : `Answer the question in short, human-like sentences: ${message || ""}`;

    const contents = [{ parts: [{ text: promptText }] }];

    // Attach image if present, safely
    if (image) {
      const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, '');
      contents[0].image = { imageBytes: cleanBase64 };
    }

    const requestBody = {
      contents,
      temperature: 0.7,
      maxOutputTokens: 300  // safe for text + image
    };

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey
        },
        body: JSON.stringify(requestBody)
      }
    );

    const rawText = await response.text();

    if (!response.ok) {
      console.error("Gemini API error:", rawText);
      return res.status(500).json({ error: "Gemini API returned error", rawResponse: rawText });
    }

    let data;
    try { data = JSON.parse(rawText); } 
    catch (err) {
      console.error("Failed to parse JSON:", rawText);
      return res.status(500).json({ error: "Gemini API did not return JSON", rawResponse: rawText });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
      || (language === "ta" ? "மன்னிக்கவும், பதிலை பெற முடியவில்லை." : "Sorry, I couldn’t generate a reply.");

    res.status(200).json({ reply });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: err.message });
  }
}
