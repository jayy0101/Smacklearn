const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");
const Groq = require("groq-sdk");

dotenv.config();

const app = express();
const PORT = 3000;
const REQUEST_TIMEOUT_MS = 25000;

app.use(cors());
app.use(express.json({ limit: "20kb" }));

const gemini = process.env.GEMINI_API_KEY
    ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    : null;

const groq = process.env.GROQ_API_KEY
    ? new Groq({ apiKey: process.env.GROQ_API_KEY })
    : null;

const systemInstruction =
    "You are SmackLearn Tutor, a friendly educational assistant. " +
    "Explain concepts clearly for college students using simple language. " +
    "Give examples and code when useful. Explain programming steps and never invent facts.";

app.get("/", (req, res) => {
    res.json({
        message: "SmackLearn AI Tutor backend is running!",
        status: "success"
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        service: "SmackLearn AI Tutor",
        providers: {
            gemini: Boolean(gemini),
            groq: Boolean(groq)
        }
    });
});

async function askGemini(question) {
    if (!gemini) {
        throw new Error("Gemini API key is not configured.");
    }

    const response = await gemini.models.generateContent({
        model: "gemini-3.8-flash",
        contents: question,
        config: {
            systemInstruction
        }
    });

    const answer = response.text;

    if (!answer || !answer.trim()) {
        throw new Error("Gemini returned an empty answer.");
    }

    return answer.trim();
}

async function askGroq(question) {
    if (!groq) {
        throw new Error("Groq API key is not configured.");
    }

    const completion = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
            {
                role: "system",
                content: systemInstruction
            },
            {
                role: "user",
                content: question
            }
        ],
        temperature: 0.5,
        max_tokens: 1200
    });

    const answer = completion.choices?.[0]?.message?.content;

    if (!answer || !answer.trim()) {
        throw new Error("Groq returned an empty answer.");
    }

    return answer.trim();
}

app.post("/api/tutor", async (req, res) => {
    const { question, provider = "auto" } = req.body || {};

    if (typeof question !== "string" || !question.trim()) {
        return res.status(400).json({
            error: "Please enter a question."
        });
    }

    if (question.length > 4000) {
        return res.status(400).json({
            error: "Your question must be 4000 characters or fewer."
        });
    }

    if (!["auto", "gemini", "groq"].includes(provider)) {
        return res.status(400).json({
            error: "Provider must be auto, gemini, or groq."
        });
    }

    const questionText = question.trim();
    const providersToTry =
        provider === "auto" ? ["gemini", "groq"] : [provider];

    const errors = [];

    for (const currentProvider of providersToTry) {
        console.log(`Trying ${currentProvider}...`);

        try {
            const answer = await Promise.race([
                currentProvider === "gemini"
                    ? askGemini(questionText)
                    : askGroq(questionText),

                new Promise((_, reject) => {
                    setTimeout(
                        () => reject(new Error("Provider timed out.")),
                        REQUEST_TIMEOUT_MS
                    );
                })
            ]);

            console.log(`${currentProvider} answered successfully.`);

            if (!res.headersSent) {
                return res.json({
                    answer,
                    provider: currentProvider
                });
            }

            return;
        } catch (error) {
            const message = error?.message || "Unknown provider error";

            console.error(`${currentProvider} failed: ${message}`);
            errors.push(`${currentProvider}: ${message}`);

            if (provider !== "auto") {
                break;
            }
        }
    }

    if (!res.headersSent) {
        return res.status(503).json({
            error: "Both AI attempts failed. Please try again shortly.",
            details: errors
        });
    }
});

app.listen(PORT, () => {
    console.log(`SmackLearn backend running at http://localhost:${PORT}`);
});