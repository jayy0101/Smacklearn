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
    const resultsStatus = document.getElementById("resultsStatus");
    const resultContent = document.getElementById("resultContent");
    const resultTabs = document.querySelectorAll(".result-tab");

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
    // 17. CHECK QUIZ ANSWERS
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

                if (
                    selectedAnswer &&
                    selectedAnswer.toLowerCase() ===
                    item.answer.toLowerCase()
                ) {
                    score++;

                    if (feedback) {
                        feedback.textContent =
                            `Correct! ${item.explanation}`;
                    }
                } else if (feedback) {
                    feedback.textContent =
                        `Not quite. The correct answer is: ${item.answer}.`;
                }
            });

            const scoreElement =
                resultContent.querySelector("#quizScore");

            if (scoreElement) {
                scoreElement.textContent =
                    `Your score: ${score}/${generatedMaterials.quiz.length}` +
                    (unanswered ? ` · ${unanswered} unanswered` : "");
            }
        });
    }

    // ==========================================
    // 18. GENERATE STUDY KIT
    // ==========================================

    if (generateButton) {
        generateButton.addEventListener("click", event => {
            event.preventDefault();

            const text = notesInput
                ? notesInput.value.trim()
                : "";

            if (!text) {
                if (resultsStatus) {
                    resultsStatus.textContent =
                        "ADD YOUR STUDY MATERIAL";
                }

                if (notesInput) notesInput.focus();

                return;
            }

            generateButton.disabled = true;

            const buttonText =
                generateButton.querySelector("span");

            if (buttonText) {
                buttonText.textContent = "Preparing materials...";
            }

            if (resultsStatus) {
                resultsStatus.textContent =
                    "CREATING YOUR STUDY KIT";
            }

            setTimeout(() => {
                try {
                    generatedMaterials = createMaterials(text);

                    const requestedType = outputType
                        ? outputType.value
                        : "all";

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
                            "YOUR STUDY KIT IS READY";
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
                    console.error(
                        "SmackLearn generation error:",
                        error
                    );

                    if (resultsStatus) {
                        resultsStatus.textContent =
                            "GENERATION FAILED — CHECK THE CONSOLE";
                    }
                } finally {
                    generateButton.disabled = false;

                    if (buttonText) {
                        buttonText.textContent =
                            "Generate study materials";
                    }
                }
            }, 200);
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

    console.log("SmackLearn initialized successfully.");
});