document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ==========================================
    // 1. ELEMENTS
    // ==========================================

    const heroVideo = document.getElementById("heroVideo");
    const notesInput = document.getElementById("studyNotes");
    const characterCount = document.getElementById("characterCount");
    const clearButton = document.getElementById("clearNotes");
    const generateButton = document.getElementById("generateButton");
    const outputType = document.getElementById("outputType");
    const aiProvider = document.getElementById("aiProvider");
    const resultsStatus = document.getElementById("resultsStatus");
    const resultContent = document.getElementById("resultContent");
    const resultTabs = document.querySelectorAll(".result-tab");
    // ==========================================
// WEAK-SPOT TRACKING ELEMENTS
// ==========================================

const weakSpotsCount = document.getElementById("weakSpotsCount");
const totalQuestionsAnswered = document.getElementById("totalQuestionsAnswered");
const overallAccuracy = document.getElementById("overallAccuracy");
const topWeakTopic = document.getElementById("topWeakTopic");
const topicChart = document.getElementById("topicChart");
const weakTopicsList = document.getElementById("weakTopicsList");
const practiceWeakTopics = document.getElementById("practiceWeakTopics");

const QUIZ_HISTORY_KEY = "smacklearn_quiz_history_v1";

let quizHistory = loadQuizHistory();
let practiceMode = false;

function loadQuizHistory() {
    try {
        const saved = localStorage.getItem(QUIZ_HISTORY_KEY);
        const parsed = saved ? JSON.parse(saved) : [];

        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Could not load quiz history:", error);
        return [];
    }
}

function saveQuizHistory() {
    try {
        localStorage.setItem(
            QUIZ_HISTORY_KEY,
            JSON.stringify(quizHistory)
        );
    } catch (error) {
        console.error("Could not save quiz history:", error);
    }
}

    let activeTab = "summary";
    let generatedMaterials = null;
    let fadeFrame = null;

    // ==========================================
    // 2. CINEMATIC HERO VIDEO
    // ==========================================

    if (heroVideo) {
        heroVideo.style.opacity = "0";

        function fadeVideo(target, duration = 500) {
            if (fadeFrame !== null) {
                cancelAnimationFrame(fadeFrame);
            }

            const startOpacity = Number(heroVideo.style.opacity) || 0;
            const startTime = performance.now();

            function animate(now) {
                const progress = Math.min(
                    (now - startTime) / duration,
                    1
                );

                const eased = 1 - Math.pow(1 - progress, 3);

                heroVideo.style.opacity =
                    startOpacity +
                    (target - startOpacity) * eased;

                if (progress < 1) {
                    fadeFrame = requestAnimationFrame(animate);
                } else {
                    fadeFrame = null;
                }
            }

            fadeFrame = requestAnimationFrame(animate);
        }

        heroVideo.addEventListener("canplay", () => {
            heroVideo.play()
                .then(() => fadeVideo(1))
                .catch(() => {});
        }, { once: true });

        heroVideo.addEventListener("timeupdate", () => {
            if (
                Number.isFinite(heroVideo.duration) &&
                heroVideo.duration - heroVideo.currentTime <= 0.6
            ) {
                fadeVideo(0);
            }
        });

        heroVideo.addEventListener("ended", () => {
            heroVideo.style.opacity = "0";

            setTimeout(() => {
                heroVideo.currentTime = 0;

                heroVideo.play()
                    .then(() => fadeVideo(1))
                    .catch(() => {});
            }, 150);
        });

        if (heroVideo.readyState >= 3) {
            heroVideo.play()
                .then(() => fadeVideo(1))
                .catch(() => {});
        }
    }

    // ==========================================
    // 3. CHARACTER COUNTER
    // ==========================================

    function updateCharacterCount() {
        if (!notesInput || !characterCount) return;

        const count = notesInput.value.length;

        characterCount.textContent =
            `${count.toLocaleString()} character${count === 1 ? "" : "s"}`;
    }

    if (notesInput) {
        notesInput.addEventListener("input", updateCharacterCount);
        updateCharacterCount();
    }

    // ==========================================
    // 4. CLEAR NOTES
    // ==========================================

    if (clearButton && notesInput) {
        clearButton.addEventListener("click", () => {
            notesInput.value = "";
            updateCharacterCount();
            notesInput.focus();
        });
    }

    // ==========================================
    // 5. SECURITY HELPER
    // ==========================================

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return entities[character];
        });
    }
    // ==========================================
// WEAK-SPOT TOPIC DETECTION
// ==========================================

function detectQuizTopic(item) {
    const text = [
        item.topic || "",
        item.term || "",
        item.question || "",
        item.explanation || ""
    ].join(" ").toLowerCase();

    const topicRules = [
        {
            name: "SQL Joins",
            keywords: ["sql join", "inner join", "left join", "right join",
                "full join", "cross join"]
        },
        {
            name: "SQL",
            keywords: ["sql", "database", "select query", "primary key",
                "foreign key", "normalization", "dbms"]
        },
        {
            name: "Python",
            keywords: ["python", "list comprehension", "dictionary",
                "tuple", "python function"]
        },
        {
            name: "Java",
            keywords: ["java", "inheritance", "polymorphism",
                "constructor", "encapsulation", "interface"]
        },
        {
            name: "HTML & CSS",
            keywords: ["html", "css", "stylesheet", "web page",
                "markup language"]
        },
        {
            name: "JavaScript",
            keywords: ["javascript", "dom", "event listener",
                "async", "promise"]
        },
        {
            name: "Mathematics",
            keywords: ["equation", "function", "matrix", "probability",
                "derivative", "integral"]
        },
        {
            name: "Artificial Intelligence",
            keywords: ["artificial intelligence", "machine learning",
                "neural network", "deep learning", "llm"]
        }
    ];

    for (const rule of topicRules) {
        if (rule.keywords.some(keyword => text.includes(keyword))) {
            return rule.name;
        }
    }

    // Use the term when available, otherwise use a general category.
    if (item.term) {
        return String(item.term).trim().slice(0, 60);
    }

    return "General Concepts";
}

// ==========================================
// RECORD QUIZ ANSWERS
// ==========================================

function recordQuizAttempt(item, selectedAnswer, isCorrect) {
    quizHistory.push({
        topic: detectQuizTopic(item),
        question: String(item.question || ""),
        options: Array.isArray(item.options) ? [...item.options] : [],
        answer: String(item.answer || ""),
        explanation: String(item.explanation || ""),
        selectedAnswer: selectedAnswer === null
            ? null
            : String(selectedAnswer),
        isCorrect,
        timestamp: new Date().toISOString()
    });

    saveQuizHistory();
    updateWeakSpotsDashboard();
}

// ==========================================
// CALCULATE TOPIC PERFORMANCE
// ==========================================

function getTopicStatistics() {
    const topics = {};

    quizHistory.forEach(attempt => {
        const topic = attempt.topic || "General Concepts";

        if (!topics[topic]) {
            topics[topic] = {
                total: 0,
                correct: 0,
                wrong: 0
            };
        }

        topics[topic].total++;

        if (attempt.isCorrect) {
            topics[topic].correct++;
        } else {
            topics[topic].wrong++;
        }
    });

    return Object.entries(topics)
        .map(([name, stats]) => ({
            name,
            ...stats,
            accuracy: Math.round(
                (stats.correct / stats.total) * 100
            )
        }))
        .sort((a, b) => a.accuracy - b.accuracy);
}
// ==========================================
// GENERATE A QUIZ FROM WEAK TOPICS
// ==========================================

function generateWeakTopicQuiz() {
    const topicStatistics = getTopicStatistics();

    const weakTopicNames = new Set(
        topicStatistics
            .filter(topic => topic.accuracy < 70)
            .map(topic => topic.name)
    );

    // Find previously incorrect questions from weak topics.
    const incorrectQuestions = quizHistory.filter(attempt =>
        !attempt.isCorrect &&
        weakTopicNames.has(attempt.topic) &&
        Array.isArray(attempt.options) &&
        attempt.options.length >= 2 &&
        attempt.options.includes(attempt.answer)
    );

    // Keep the most recent incorrect questions.
    const uniqueQuestions = [];
    const seenQuestions = new Set();

    incorrectQuestions
        .slice()
        .reverse()
        .forEach(attempt => {
            const key = `${attempt.topic}::${attempt.question}`;

            if (seenQuestions.has(key)) return;

            seenQuestions.add(key);
            uniqueQuestions.push(attempt);
        });

    if (!uniqueQuestions.length) {
        return [];
    }

    return shuffleArray(uniqueQuestions)
        .slice(0, 10)
        .map((attempt, index) => ({
            number: index + 1,
            topic: attempt.topic,
            term: attempt.topic,
            question: attempt.question,
            options: shuffleArray(attempt.options),
            answer: attempt.answer,
            explanation: attempt.explanation ||
                `Review the concept: ${attempt.topic}.`
        }));
}

// ==========================================
// START WEAK-TOPIC PRACTICE
// ==========================================

if (practiceWeakTopics) {
    practiceWeakTopics.addEventListener("click", () => {
        const questions = generateWeakTopicQuiz();

        if (!questions.length) {
            alert(
                "There are no saved incorrect questions for your weak topics yet. " +
                "Complete another quiz and try again."
            );
            return;
        }

        generatedMaterials = {
            summary: [],
            quiz: questions,
            flashcards: []
        };

        practiceMode = true;
        activeTab = "quiz";

        renderActiveTab();

        if (resultsStatus) {
            resultsStatus.textContent =
                "WEAK-TOPIC PRACTICE READY";
        }

        const resultsSection =
            document.getElementById("resultsSection");

        if (resultsSection) {
            resultsSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    });
}

// ==========================================
// UPDATE DASHBOARD
// ==========================================

function updateWeakSpotsDashboard() {
    if (
        !totalQuestionsAnswered ||
        !overallAccuracy ||
        !topWeakTopic ||
        !topicChart ||
        !weakTopicsList
    ) {
        return;
    }

    const total = quizHistory.length;
    const correct = quizHistory.filter(item => item.isCorrect).length;
    const accuracy = total
        ? Math.round((correct / total) * 100)
        : 0;

    const statistics = getTopicStatistics();

    // A topic is weak when its accuracy is below 70%.
    const weakTopics = statistics.filter(topic =>
        topic.accuracy < 70
    );

    totalQuestionsAnswered.textContent = total;
    overallAccuracy.textContent = total ? `${accuracy}%` : "—";
    topWeakTopic.textContent = weakTopics.length
        ? weakTopics[0].name
        : (total ? "None identified" : "—");

    if (weakSpotsCount) {
        weakSpotsCount.textContent =
            `${weakTopics.length} weak topic${weakTopics.length === 1 ? "" : "s"}`;
    }

    if (!statistics.length) {
        topicChart.innerHTML = `
            <div class="weak-spots-empty">
                Complete a quiz to see your topic performance here.
            </div>
        `;

        weakTopicsList.innerHTML = `
            <div class="weak-spots-empty">
                Your weak topics will appear here after you answer quiz questions.
            </div>
        `;
    } else {
        topicChart.innerHTML = statistics.map(topic => `
            <div class="topic-chart-row">
                <span class="topic-chart-label">
                    ${escapeHTML(topic.name)}
                </span>

                <div class="topic-chart-track">
                    <div
                        class="topic-chart-fill"
                        style="width: ${topic.accuracy}%"
                    ></div>
                </div>

                <span class="topic-chart-value">
                    ${topic.accuracy}%
                </span>
            </div>
        `).join("");

        weakTopicsList.innerHTML = weakTopics.length
            ? weakTopics.map(topic => `
                <div class="weak-topic-item">
                    <div>
                        <strong>${escapeHTML(topic.name)}</strong>
                        <small>
                            ${topic.correct} correct out of ${topic.total}
                            answered
                        </small>
                    </div>

                    <span class="weak-topic-accuracy">
                        ${topic.accuracy}% accuracy
                    </span>
                </div>
            `).join("")
            : `
                <div class="weak-spots-empty">
                    Great progress! No topics currently fall below 70% accuracy.
                </div>
            `;
    }

    if (practiceWeakTopics) {
        practiceWeakTopics.disabled = weakTopics.length === 0;
    }
}

    // ==========================================
    // 6. CLEAN AND PROCESS NOTES
    // ==========================================

    function cleanNotes(text) {
        return text
            .replace(/\r\n?/g, "\n")
            .replace(/[\u200B-\u200D\uFEFF]/g, "")
            .trim();
    }

    function removeMetadata(line) {
        return !/^(lecture\s*\d*\s*:|duration\s*:|target audience\s*:|subject\s*:|course\s*:|date\s*:)/i
            .test(line.trim());
    }

    function getLines(text) {
        return cleanNotes(text)
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean)
            .filter(removeMetadata);
    }

    function splitSentences(text) {
        const lines = getLines(text);
        const sentences = [];

        lines.forEach(line => {
            // Preserve each line, but split multiple sentences on that line.
            const parts = line
                .split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/);

            parts.forEach(part => {
                const sentence = part
                    .replace(/^[\s•\-*#]+/, "")
                    .replace(/^\d+[.)]\s*/, "")
                    .trim();

                if (sentence.length > 0) {
                    sentences.push(sentence);
                }
            });
        });

        return sentences;
    }

    function normalizeTerm(term) {
        return term
            .toLowerCase()
            .replace(/[^a-z0-9\s+#.-]/g, "")
            .trim();
    }

    function uniqueByText(items) {
        const seen = new Set();

        return items.filter(item => {
            const key = item.toLowerCase().trim();

            if (seen.has(key)) return false;

            seen.add(key);
            return true;
        });
    }

    // ==========================================
    // 7. FIND DEFINITIONS IN NOTES
    // ==========================================

    function extractDefinitions(text) {
        const sentences = splitSentences(text);
        const definitions = [];

        const patterns = [
            // HTML is a markup language.
            /^(.{2,70}?)\s+(?:is|are)\s+(?:a|an|the)\s+(.+)$/i,

            // HTML is used to structure web pages.
            /^(.{2,70}?)\s+(?:is|are)\s+used\s+to\s+(.+)$/i,

            // HTML means HyperText Markup Language.
            /^(.{2,70}?)\s+(?:means|refers to)\s+(.+)$/i,

            // HTML: a markup language used for web pages.
            /^(.{2,50}?)\s*:\s*(.{8,})$/i,

            // Definition of HTML: ...
            /^definition of\s+(.{2,50}?)\s*:\s*(.+)$/i
        ];

        sentences.forEach(sentence => {
            let term = "";
            let answer = "";

            // Try the most explicit patterns first.
            for (const pattern of patterns) {
                const match = sentence.match(pattern);

                if (!match) continue;

                if (/^definition of/i.test(sentence)) {
                    term = match[1].trim();
                    answer = match[2].trim();
                } else {
                    term = match[1].trim();
                    answer = match[2].trim();
                }

                break;
            }

            if (!term || !answer) return;

            term = term
                .replace(/^[\s•\-*#\d.)]+/, "")
                .replace(/[.!?]+$/, "")
                .trim();

            answer = answer
                .replace(/[.!?]+$/, "")
                .trim();

            if (
                term.length < 2 ||
                term.length > 70 ||
                answer.length < 8 ||
                term.split(/\s+/).length > 8
            ) {
                return;
            }

            // Ignore metadata accidentally formatted like a definition.
            if (!removeMetadata(term)) return;

            definitions.push({
                term,
                answer,
                original: sentence
            });
        });

        const seen = new Set();

        return definitions.filter(definition => {
            const key = normalizeTerm(definition.term);

            if (seen.has(key)) return false;

            seen.add(key);
            return true;
        });
    }

    // ==========================================
    // 8. SUMMARY GENERATOR
    // ==========================================

    function makeSummary(text, style) {
        const sentences = uniqueByText(
            splitSentences(text).filter(sentence =>
                sentence.length > 12
            )
        );

        if (!sentences.length) return [];

        let limit = 8;

        if (style === "simple") {
            limit = 3;
        } else if (style === "exam") {
            limit = 6;
        } else if (style === "examples") {
            limit = 4;
        }

        // Prefer useful definition sentences where available.
        const definitions = extractDefinitions(text);
        const preferred = definitions.map(item => item.original);

        const ordered = uniqueByText([
            ...preferred,
            ...sentences
        ]);

        return ordered.slice(0, limit);
    }

    // ==========================================
    // 9. MULTIPLE-CHOICE QUIZ GENERATOR
    // ==========================================

    function shuffleArray(array) {
        const result = [...array];

        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            [result[i], result[j]] = [
                result[j],
                result[i]
            ];
        }

        return result;
    }

    function makeQuestions(text, difficulty) {
        const definitions = extractDefinitions(text);

        if (definitions.length < 2) {
            return [];
        }

        const questions = [];

        definitions.slice(0, 5).forEach(definition => {
            const distractors = definitions
                .filter(item =>
                    normalizeTerm(item.term) !==
                    normalizeTerm(definition.term)
                )
                .map(item => item.answer)
                .filter(answer =>
                    answer.toLowerCase() !==
                    definition.answer.toLowerCase()
                );

            // A multiple-choice question needs at least one wrong option.
            if (!distractors.length) return;

            let question;

            if (difficulty === "easy") {
                question = `What does "${definition.term}" mean?`;
            } else if (difficulty === "hard") {
                question =
                    `Which option best describes "${definition.term}"?`;
            } else {
                question =
                    `Which statement correctly defines "${definition.term}"?`;
            }

            const options = shuffleArray(uniqueByText([
                definition.answer,
                ...distractors.slice(0, 3)
            ]));

            questions.push({
                number: questions.length + 1,
                term: definition.term,
                question,
                answer: definition.answer,
                options,
                explanation:
                    `"${definition.term}" is described in your notes as ${definition.answer}.`
            });
        });

        return questions;
    }

    // ==========================================
    // 10. FLASHCARD GENERATOR
    // ==========================================

    function makeFlashcards(text) {
        const definitions = extractDefinitions(text);

        // Definition-style cards are more useful than generic prompts.
        if (definitions.length > 0) {
            return definitions.slice(0, 8).map((item, index) => ({
                number: index + 1,
                question: `What is ${item.term}?`,
                answer: item.answer
            }));
        }

        // If no definitions are found, use headings or meaningful lines.
        const lines = getLines(text)
            .map(line =>
                line
                    .replace(/^[\s•\-*#]+/, "")
                    .replace(/^\d+[.)]\s*/, "")
                    .trim()
            )
            .filter(line => line.length >= 15);

        return uniqueByText(lines)
            .slice(0, 8)
            .map((line, index) => ({
                number: index + 1,
                question: `Explain this key point: ${line.length > 75 ? line.slice(0, 75) + "…" : line}`,
                answer: line
            }));
    }
// ==========================================
// AI STUDY KIT API
// ==========================================

async function generateAIStudyKit(notes, provider, difficulty, style) {
    const response = await fetch("http://localhost:3000/api/study-kit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            notes,
            provider,
            difficulty,
            style
        })
    });

    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error("The backend returned an invalid response.");
    }

    if (!response.ok) {
        const details = Array.isArray(data.details)
            ? data.details.join("; ")
            : "";

        throw new Error(
            [data.error || "Study kit generation failed.", details]
                .filter(Boolean)
                .join(" ")
        );
    }

    if (!data.materials) {
        throw new Error("The backend returned no study materials.");
    }

    return data.materials;
}
    // ==========================================
    // 11. CREATE STUDY MATERIALS
    // ==========================================

    function createMaterials(text) {
        const styleElement = document.getElementById("studyStyle");
        const difficultyElement = document.getElementById("quizDifficulty");

        const style = styleElement
            ? styleElement.value
            : "standard";

        const difficulty = difficultyElement
            ? difficultyElement.value
            : "medium";

        return {
            summary: makeSummary(text, style),
            quiz: makeQuestions(text, difficulty),
            flashcards: makeFlashcards(text)
        };
    }

    // ==========================================
    // 12. RENDER SUMMARY
    // ==========================================

    function renderSummary() {
        const summary = generatedMaterials.summary;

        if (!summary.length) {
            return `
                <div class="empty-state">
                    <h3>No summary available yet.</h3>
                    <p>Add your lecture notes with a few meaningful sentences.</p>
                </div>
            `;
        }

        return `
            <h3>Your study summary</h3>
            <p>Review the key points extracted from your notes.</p>

            <ul>
                ${summary.map(sentence => `
                    <li>${escapeHTML(sentence)}</li>
                `).join("")}
            </ul>

            <p class="answer">
                This version extracts and organizes text locally.
                It does not yet use an AI model.
            </p>
        `;
    }

    // ==========================================
    // 13. RENDER QUIZ
    // ==========================================

    function renderQuiz() {
        const questions = generatedMaterials.quiz;

        if (!questions.length) {
            return `
                <div class="empty-state">
                    <h3>We need more definitions for a quiz.</h3>

                    <p>
                        The current quiz generator needs at least two
                        distinct definitions so it can create answer options.
                    </p>

                    <p><strong>Example notes:</strong></p>

                    <p>
                        HTML is a markup language used to structure web pages.
                    </p>

                    <p>
                        CSS is a stylesheet language used to control the
                        appearance of web pages.
                    </p>

                    <p>
                        JavaScript is a programming language used to add
                        interactive behavior to web pages.
                    </p>
                </div>
            `;
        }

        return `
            <h3>Practice questions</h3>

            <p>
                Select an answer for each question, then check your score.
            </p>

            <form id="quizForm">
                ${questions.map((item, index) => `
                    <div class="question-card">
                        <strong>
                            ${index + 1}. ${escapeHTML(item.question)}
                        </strong>

                        <div class="quiz-options">
                            ${item.options.map((option, optionIndex) => `
                                <label class="quiz-option">
                                    <input
                                        type="radio"
                                        name="question-${index}"
                                        value="${optionIndex}"
                                    >

                                    <span>${escapeHTML(option)}</span>
                                </label>
                            `).join("")}
                        </div>

                        <div
                            class="quiz-feedback"
                            id="feedback-${index}"
                            aria-live="polite"
                        ></div>
                    </div>
                `).join("")}

                <button type="submit" class="primary-button">
                    Check my answers
                </button>

                <div
                    id="quizScore"
                    class="answer"
                    aria-live="polite"
                ></div>
            </form>
        `;
    }

    // ==========================================
    // 14. RENDER FLASHCARDS
    // ==========================================

    function renderFlashcards() {
        const cards = generatedMaterials.flashcards;

        if (!cards.length) {
            return `
                <div class="empty-state">
                    <h3>No flashcards available.</h3>
                    <p>Add definitions, concepts, or complete notes first.</p>
                </div>
            `;
        }

        return `
            <h3>Your flashcards</h3>

            <p>
                Try to answer each question before revealing the answer.
            </p>

            ${cards.map(card => `
                <div class="flashcard">
                    <strong>
                        ${card.number}. ${escapeHTML(card.question)}
                    </strong>

                    <details>
                        <summary>Reveal answer</summary>

                        <p class="answer">
                            ${escapeHTML(card.answer)}
                        </p>
                    </details>
                </div>
            `).join("")}
        `;
    }

    // ==========================================
    // 15. UPDATE ACTIVE TAB
    // ==========================================

    function renderActiveTab() {
        resultTabs.forEach(tab => {
            const isActive = tab.dataset.tab === activeTab;

            tab.classList.toggle("active", isActive);
            tab.setAttribute("aria-selected", String(isActive));
        });

        if (!generatedMaterials || !resultContent) return;

        if (activeTab === "summary") {
            resultContent.innerHTML = renderSummary();
        } else if (activeTab === "quiz") {
            resultContent.innerHTML = renderQuiz();
        } else if (activeTab === "flashcards") {
            resultContent.innerHTML = renderFlashcards();
        }
    }

    // ==========================================
    // 16. TAB CLICK HANDLERS
    // ==========================================

    resultTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            activeTab = tab.dataset.tab;
            renderActiveTab();
        });
    });
// ==========================================
// 17. CHECK QUIZ ANSWERS + TRACK WEAK SPOTS
// ==========================================

if (resultContent) {
    resultContent.addEventListener("submit", event => {
        if (event.target.id !== "quizForm") return;

        event.preventDefault();

        if (!generatedMaterials) return;

        let score = 0;
        let unanswered = 0;

        generatedMaterials.quiz.forEach((item, index) => {
            const selected = resultContent.querySelector(
                `input[name="question-${index}"]:checked`
            );

            const feedback = resultContent.querySelector(
                `#feedback-${index}`
            );

            if (!selected) {
                unanswered++;

                if (feedback) {
                    feedback.textContent = "Choose an answer first.";
                }

                return;
            }

            const selectedIndex = Number(selected.value);
            const selectedAnswer = item.options[selectedIndex];

            const isCorrect = Boolean(
                selectedAnswer &&
                selectedAnswer.toLowerCase() ===
                item.answer.toLowerCase()
            );

            if (isCorrect) {
                score++;

                if (feedback) {
                    feedback.textContent =
                        `Correct! ${item.explanation || ""}`;
                }
            } else if (feedback) {
                feedback.textContent =
                    `Not quite. The correct answer is: ${item.answer}.`;
            }

            // Record each answered question only once per submission.
            if (!event.target.dataset.submitted) {
                recordQuizAttempt(item, selectedAnswer, isCorrect);
            }
        });

        // Prevent duplicate history entries if the same quiz is submitted again.
        event.target.dataset.submitted = "true";

        const scoreElement =
            resultContent.querySelector("#quizScore");

        if (scoreElement) {
            scoreElement.textContent =
                `Your score: ${score}/${generatedMaterials.quiz.length}` +
                (unanswered ? ` · ${unanswered} unanswered` : "");
        }

        // Lock the submitted quiz to prevent accidental repeat submissions.
        event.target.querySelectorAll(
            'input[type="radio"], button[type="submit"]'
        ).forEach(element => {
            element.disabled = true;
        });
    });
}

    // ==========================================
// 18. GENERATE STUDY KIT
// ==========================================

if (generateButton) {
    generateButton.addEventListener("click", async event => {
        event.preventDefault();

        const text = notesInput
            ? notesInput.value.trim()
            : "";

        if (!text) {
            if (resultsStatus) {
                resultsStatus.textContent =
                    "ADD YOUR STUDY MATERIAL";
            }

            if (notesInput) {
                notesInput.focus();
            }

            return;
        }

        if (text.length > 12000) {
            if (resultsStatus) {
                resultsStatus.textContent =
                    "NOTES MUST BE 12000 CHARACTERS OR FEWER";
            }

            return;
        }

        const selectedProvider = aiProvider
            ? aiProvider.value
            : "local";

        const selectedStyle =
            document.getElementById("studyStyle")?.value || "standard";

        const selectedDifficulty =
            document.getElementById("quizDifficulty")?.value || "medium";

        const requestedType = outputType
            ? outputType.value
            : "all";

        const buttonText = generateButton.querySelector("span");

        generateButton.disabled = true;

        if (buttonText) {
            buttonText.textContent = "Generating...";
        }

        if (resultsStatus) {
            resultsStatus.textContent =
                selectedProvider === "local"
                    ? "CREATING MATERIALS LOCALLY"
                    : "AI IS GENERATING YOUR STUDY KIT";
        }

        try {
            let materials;

            if (selectedProvider === "local") {
                // Preserve the existing local generator.
                materials = createMaterials(text);
            } else {
                // Request AI-generated materials from the backend.
                const aiMaterials = await generateAIStudyKit(
                    text,
                    selectedProvider,
                    selectedDifficulty,
                    selectedStyle
                );

                // Convert the AI response into the structure
                // expected by the existing rendering functions.
                materials = {
                    summary: aiMaterials.summary.map(item =>
                        String(item)
                    ),

                    quiz: aiMaterials.quiz.map((item, index) => ({
                        number: index + 1,
                        term: item.question,
                        question: item.question,
                        options: shuffleArray([...item.options]),
                        answer: item.answer,
                        explanation: item.explanation || ""
                    })),

                    flashcards: aiMaterials.flashcards.map(
                        (item, index) => ({
                            number: index + 1,
                            question: item.question,
                            answer: item.answer
                        })
                    )
                };
            }

            generatedMaterials = materials;

            // Support Summary, Quiz, Flashcards, and Everything.
            activeTab = [
                "summary",
                "quiz",
                "flashcards"
            ].includes(requestedType)
                ? requestedType
                : "summary";

            renderActiveTab();

            if (resultsStatus) {
                resultsStatus.textContent =
                    selectedProvider === "local"
                        ? "LOCAL STUDY KIT READY"
                        : `AI STUDY KIT READY (${selectedProvider.toUpperCase()})`;
            }

            const resultsSection =
                document.getElementById("resultsSection");

            if (resultsSection) {
                resultsSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

        } catch (error) {
            console.error("Study Kit generation error:", error);

            if (resultsStatus) {
                resultsStatus.textContent = "GENERATION FAILED";
            }

            if (resultContent) {
                resultContent.innerHTML = `
                    <div class="error-message">
                        <h3>Couldn't generate your study kit</h3>

                        <p>${escapeHTML(error.message)}</p>

                        <p>
                            Check that the backend is running and that
                            your selected AI provider is configured.
                        </p>

                        <button
                            type="button"
                            class="primary-button"
                            id="retryGeneration"
                        >
                            Try again
                        </button>
                    </div>
                `;

                const retryButton =
                    document.getElementById("retryGeneration");

                if (retryButton) {
                    retryButton.addEventListener("click", () => {
                        generateButton.click();
                    });
                }
            }

        } finally {
            generateButton.disabled = false;

            if (buttonText) {
                buttonText.textContent = "Generate study materials";
            }
        }
    });
}

    // ==========================================
    // 19. SCROLL REVEAL ANIMATIONS
    // ==========================================

    const revealElements = document.querySelectorAll(
        ".intro, .workspace, .features, .final-cta"
    );

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.08
        });

        revealElements.forEach(element => {
            element.classList.add("reveal");
            observer.observe(element);
        });
    }
updateWeakSpotsDashboard(); 
    console.log("SmackLearn initialized successfully.");
});