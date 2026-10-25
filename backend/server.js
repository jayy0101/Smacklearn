const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");
const Groq = require("groq-sdk");

dotenv.config({
    path: path.join(__dirname, ".env")
});

const app = express();
const PORT = 3000;
const REQUEST_TIMEOUT_MS = 25000;

app.use(cors());
app.use(express.json({ limit: "20kb" }));

// ============================================
// 1. INITIALIZE AI PROVIDERS
// ============================================

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

// ============================================
// 2. SHARED HELPER FUNCTIONS
// ============================================

async function withTimeout(promise, timeoutMs = REQUEST_TIMEOUT_MS) {
    let timeout;

    try {
        return await Promise.race([
            promise,
            new Promise((_, reject) => {
                timeout = setTimeout(() => {
                    reject(new Error("Provider timed out."));
                }, timeoutMs);
            })
        ]);
    } finally {
        clearTimeout(timeout);
    }
}

async function askGemini(question) {
    if (!gemini) {
        throw new Error("Gemini API key is not configured.");
    }

    const response = await withTimeout(
        gemini.models.generateContent({
            model: "gemini-3.8-flash",
            contents: question,
            config: {
                systemInstruction
            }
        })
    );

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

    const completion = await withTimeout(
        groq.chat.completions.create({
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
            max_tokens: 1800
        })
    );

    const answer = completion.choices?.[0]?.message?.content;

    if (!answer || !answer.trim()) {
        throw new Error("Groq returned an empty answer.");
    }

    return answer.trim();
}

// ============================================
// 3. HEALTH CHECK
// ============================================

app.get("/", (req, res) => {
    res.json({
        message: "SmackLearn backend is running!",
        status: "success"
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        service: "SmackLearn",
        providers: {
            gemini: Boolean(gemini),
            groq: Boolean(groq)
        }
    });
});

// ============================================
// 4. AI TUTOR API
// ============================================

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
        console.log(`Tutor: trying ${currentProvider}...`);

        try {
            const answer = currentProvider === "gemini"
                ? await askGemini(questionText)
                : await askGroq(questionText);

            console.log(`Tutor: ${currentProvider} answered successfully.`);

            return res.json({
                answer,
                provider: currentProvider
            });
        } catch (error) {
            const message = error?.message || "Unknown provider error";

            console.error(`Tutor ${currentProvider} failed: ${message}`);
            errors.push(`${currentProvider}: ${message}`);

            if (provider !== "auto") {
                break;
            }
        }
    }

    return res.status(503).json({
        error: "AI Tutor could not generate a response. Please try again.",
        details: errors
    });
});

// ============================================
// 5. STUDY KIT AI PROMPT
// ============================================

function buildStudyKitPrompt(notes, difficulty, style) {
    const styleInstructions = {
        simple: "Use very simple language suitable for beginners.",
        standard: "Use clear explanations suitable for college students.",
        exam: "Focus on exam-relevant definitions, concepts, and important facts.",
        examples: "Include practical examples wherever useful."
    };

    const difficultyInstructions = {
        easy: "Create beginner-friendly questions.",
        medium: "Create questions of moderate difficulty.",
        hard: "Create challenging but fair questions."
    };

    return `
You are SmackLearn, an educational study-material generator.

Create a study kit using the student's notes below.

STYLE:
${styleInstructions[style]}

QUIZ DIFFICULTY:
${difficultyInstructions[difficulty]}

Return ONLY valid JSON. Do not use Markdown fences or additional text.

Use exactly this JSON structure:

{
  "summary": [
    "Important point 1",
    "Important point 2"
  ],
  "quiz": [
    {
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "answer": "Exact text of the correct option",
      "explanation": "A short explanation of the correct answer"
    }
  ],
  "flashcards": [
    {
      "question": "Question or term",
      "answer": "Definition or explanation"
    }
  ]
}

REQUIREMENTS:
- Produce 5 to 10 concise summary points.
- Produce exactly 5 multiple-choice questions.
- Each question must have exactly 4 distinct options.
- The answer must exactly match one of the four options.
- Explanations must be clear and educational.
- Produce 5 to 8 useful flashcards.
- Use only the supplied notes for factual claims.
- Do not invent information that is not supported by the notes.
- If a topic is unclear, keep the output limited to what the notes support.

STUDENT NOTES:
<student_notes>
${notes}
</student_notes>
`;
}

// ============================================
// 6. STUDY KIT AI PROVIDER FUNCTIONS
// ============================================

async function generateStudyKitWithGemini(prompt) {
    if (!gemini) {
        throw new Error("Gemini API key is not configured.");
    }

    const response = await withTimeout(
        gemini.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt,
            config: {
                systemInstruction:
                    "You generate accurate study materials. Return valid JSON only.",
                responseMimeType: "application/json",
                temperature: 0.3
            }
        })
    );

    const text = response.text;

    if (!text || !text.trim()) {
        throw new Error("Gemini returned an empty study kit.");
    }

    return JSON.parse(text);
}

async function generateStudyKitWithGroq(prompt) {
    if (!groq) {
        throw new Error("Groq API key is not configured.");
    }

    const completion = await withTimeout(
        groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [
                {
                    role: "system",
                    content:
                        "You generate accurate educational study materials. Return valid JSON only."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.3,
            max_tokens: 3000,
            response_format: {
                type: "json_object"
            }
        })
    );

    const text = completion.choices?.[0]?.message?.content;

    if (!text || !text.trim()) {
        throw new Error("Groq returned an empty study kit.");
    }

    return JSON.parse(text);
}

// ============================================
// 7. VALIDATE AI-GENERATED STUDY MATERIALS
// ============================================

function validateStudyKit(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error("The AI returned an invalid study kit.");
    }

    if (
        !Array.isArray(data.summary) ||
        !Array.isArray(data.quiz) ||
        !Array.isArray(data.flashcards)
    ) {
        throw new Error("The AI returned an incomplete study kit.");
    }

    const summary = data.summary
        .filter(item => typeof item === "string" && item.trim())
        .slice(0, 12)
        .map(item => item.trim());

    const quiz = data.quiz
        .filter(item => {
            if (
                !item ||
                typeof item.question !== "string" ||
                !item.question.trim() ||
                !Array.isArray(item.options) ||
                item.options.length !== 4 ||
                !item.options.every(
                    option => typeof option === "string" && option.trim()
                ) ||
                typeof item.answer !== "string"
            ) {
                return false;
            }

            return item.options.some(
                option => option.trim() === item.answer.trim()
            );
        })
        .slice(0, 5)
        .map(item => ({
            question: item.question.trim(),
            options: item.options.map(option => option.trim()),
            answer: item.answer.trim(),
            explanation:
                typeof item.explanation === "string"
                    ? item.explanation.trim()
                    : ""
        }));

    const flashcards = data.flashcards
        .filter(item =>
            item &&
            typeof item.question === "string" &&
            item.question.trim() &&
            typeof item.answer === "string" &&
            item.answer.trim()
        )
        .slice(0, 8)
        .map(item => ({
            question: item.question.trim(),
            answer: item.answer.trim()
        }));

    if (summary.length === 0 || quiz.length === 0 || flashcards.length === 0) {
        throw new Error("The AI returned incomplete study materials. Try again.");
    }

    return {
        summary,
        quiz,
        flashcards
    };
}

// ============================================
// 8. AI STUDY KIT API
// ============================================

app.post("/api/study-kit", async (req, res) => {
    const {
        notes,
        provider = "auto",
        difficulty = "medium",
        style = "standard"
    } = req.body || {};

    // Validate notes
    if (typeof notes !== "string" || !notes.trim()) {
        return res.status(400).json({
            error: "Please enter your study notes."
        });
    }

    if (notes.length > 12000) {
        return res.status(400).json({
            error: "Your notes must be 12000 characters or fewer."
        });
    }

    // Validate provider
    if (!["auto", "gemini", "groq"].includes(provider)) {
        return res.status(400).json({
            error: "Provider must be auto, gemini, or groq."
        });
    }

    // Validate difficulty and style
    if (!["easy", "medium", "hard"].includes(difficulty)) {
        return res.status(400).json({
            error: "Difficulty must be easy, medium, or hard."
        });
    }

    if (!["simple", "standard", "exam", "examples"].includes(style)) {
        return res.status(400).json({
            error: "Style must be simple, standard, exam, or examples."
        });
    }

    const prompt = buildStudyKitPrompt(
        notes.trim(),
        difficulty,
        style
    );

    const providersToTry =
        provider === "auto" ? ["gemini", "groq"] : [provider];

    const errors = [];

    for (const currentProvider of providersToTry) {
        console.log(`Study Kit: trying ${currentProvider}...`);

        try {
            const rawMaterials =
                currentProvider === "gemini"
                    ? await generateStudyKitWithGemini(prompt)
                    : await generateStudyKitWithGroq(prompt);

            const materials = validateStudyKit(rawMaterials);

            console.log(
                `Study Kit: ${currentProvider} generated materials successfully.`
            );

            return res.json({
                success: true,
                provider: currentProvider,
                materials
            });
        } catch (error) {
            const message = error?.message || "Unknown provider error";

            console.error(
                `Study Kit ${currentProvider} failed: ${message}`
            );

            errors.push(`${currentProvider}: ${message}`);

            if (provider !== "auto") {
                break;
            }
        }
    }

    return res.status(503).json({
        error: "Could not generate the study kit. Please try again.",
        details: errors
    });
});

// ============================================
// 9. START SERVER
// ============================================

app.listen(PORT, () => {
    console.log(`SmackLearn backend running at http://localhost:${PORT}`);
    console.log(
        `Gemini configured: ${Boolean(gemini)} | Groq configured: ${Boolean(groq)}`
    );
});