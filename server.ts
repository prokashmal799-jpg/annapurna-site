import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Parse request bodies
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Lazy initializer for Google GenAI client to avoid crashing on launch if the API Key is missing
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not defined. Please add it from Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// POST endpoint to generate SEO optimized high CPC content
app.post("/api/content-generator/generate", async (req, res) => {
  try {
    const { keyword, topic, additionalInstructions, tone = "professional", length = "long" } = req.body;

    if (!keyword) {
      res.status(400).json({ error: "Keyword parameter is required." });
      return;
    }

    // Attempt lazy initialization of the Gen AI client
    let ai;
    try {
      ai = getGenAI();
    } catch (apiErr: any) {
      res.status(500).json({
        error: "Missing API Key",
        message: apiErr.message || "Please configure your GEMINI_API_KEY in Settings > Secrets.",
      });
      return;
    }

    const keywordType = topic || "General Government Scheme";
    const instruct = additionalInstructions || " None / Focus on high readability for general audience of West Bengal.";

    // Construct the structured prompt
    const prompt = `You are a World-Class Bengali SEO Expert and Professional Writer. Your goal is to write a highly engaging, SEO-optimized, and clicks-worthy blog post in Bengali (বাংলা ভাষা) targeting the keyword: "${keyword}".
Topic category: "${keywordType}"
Tone: ${tone}
Length/Detail: ${length} (Write comprehensive, detailed content)
Additional Context: ${instruct}

Please construct the post carefully for maximum search engine performance (reaching Google Rank #1) by applying these SEO rules:
1. Title: Create an extremely click-worthy, urgent, and keyword-rich Bengali title (e.g., incorporating 2026 updates, 'সুখবর', step-by-step guidance).
2. Excerpt: A brief, search-snippet-friendly translation/summary of about 150-180 characters, packed with target keywords to maximize search CTR.
3. Content: Write comprehensive and detailed, formatted beautifully in Markdown. Make sure to use:
   - Proper Markdown Headings (##, ###)
   - Bulleted list points and tables where necessary to explain processes
   - Highlighted keywords in bold (**keyword**)
   - A dedicated "প্রশ্নোত্তর (FAQ)" section with 3-4 schema-friendly questions and clear answers.
4. Category: Single, clean, localized topic category name (e.g. 'DBT আধার লিঙ্ক', 'রেশন কার্ড আপডেট', 'সরকারি যোজনা').

You MUST fulfill the response JSON schema precisely. Output ONLY the valid JSON matching the schema. Do not wrap it in markdown code blocks or any other characters.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "The catchy, high CPC optimized SEO title in Bengali."
            },
            excerpt: {
              type: Type.STRING,
              description: "Brief CTR optimized summary (150-180 chars) for search result snippet."
            },
            content: {
              type: Type.STRING,
              description: "The complete article content written in high-quality Bengali with rich markdown styling."
            },
            category: {
              type: Type.STRING,
              description: "Single-tag category in Bengali e.g. 'রেশন কার্ড আপডেট'."
            }
          },
          required: ["title", "excerpt", "content", "category"]
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("No text returned from Gemini API");
    }

    const parsedData = JSON.parse(textOutput.trim());
    res.json({ success: true, article: parsedData });

  } catch (error: any) {
    console.error("Gemini Content Generation Error:", error);
    res.status(500).json({
      error: "Generation Failed",
      message: error.message || "An unexpected error occurred during content generation."
    });
  }
});

// Configure Vite middleware or static file serving
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
};

startServer();
