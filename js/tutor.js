const API_URL = "http://localhost:3000";

const chatForm = document.getElementById("chatForm");
const questionInput = document.getElementById("questionInput");
const chatMessages = document.getElementById("chatMessages");
const providerSelect = document.getElementById("providerSelect");
const sendButton = document.getElementById("sendButton");
const connectionStatus = document.getElementById("connectionStatus");
const suggestions = document.getElementById("suggestions");

// Escape HTML to safely display AI responses.
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// Format basic Markdown, including code blocks, headings, and lists.
function formatAnswer(text) {
    const escaped = escapeHTML(text);
    const codeBlocks = [];

    let formatted = escaped.replace(
        /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g,
        (_, language, code) => {
            const index = codeBlocks.length;

            const languageLabel = language
                ? `<span class="code-language">${language}</span>`
                : "";

            codeBlocks.push(
                `<pre>${languageLabel}<code>${code.trim()}</code></pre>`
            );

            return `@@CODEBLOCK${index}@@`;
        }
    );

    formatted = formatted.replace(/^### (.+)$/gm, "<h4>$1</h4>");
    formatted = formatted.replace(/^## (.+)$/gm, "<h3>$1</h3>");
    formatted = formatted.replace(/^# (.+)$/gm, "<h2>$1</h2>");

    formatted = formatted.replace(
        /\*\*(.+?)\*\*/g,
        "<strong>$1</strong>"
    );

    formatted = formatted.replace(
        /`([^`]+)`/g,
        "<code>$1</code>"
    );

    const lines = formatted.split("\n");
    const output = [];
    let inList = false;

    for (const line of lines) {
        const trimmed = line.trim();
        const listMatch = trimmed.match(/^[-*] (.+)$/);

        if (listMatch) {
            if (!inList) {
                output.push("<ul>");
                inList = true;
            }

            output.push(`<li>${listMatch[1]}</li>`);
            continue;
        }

        if (inList) {
            output.push("</ul>");
            inList = false;
        }

        if (!trimmed) {
            continue;
        }

        if (/^@@CODEBLOCK\d+@@$/.test(trimmed)) {
            output.push(trimmed);
        } else if (/^<h[234]>/.test(trimmed)) {
            output.push(trimmed);
        } else {
            output.push(`<p>${trimmed}</p>`);
        }
    }

    if (inList) {
        output.push("</ul>");
    }

    formatted = output.join("\n");

    // Restore code blocks after formatting the other text.
    formatted = formatted.replace(
        /@@CODEBLOCK(\d+)@@/g,
        (_, index) => codeBlocks[Number(index)]
    );

    return formatted;
}

// Scroll only when the user is already near the bottom.
// This avoids pulling the user away from older messages.
function scrollToLatest(force = false) {
    requestAnimationFrame(() => {
        const distanceFromBottom =
            chatMessages.scrollHeight -
            chatMessages.scrollTop -
            chatMessages.clientHeight;

        if (force || distanceFromBottom < 180) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    });
}

// Add a message to the chat.
function addMessage(role, text, provider = "") {
    const article = document.createElement("article");
    article.className = `message ${role}-message`;

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = role === "user" ? "Y" : "S";

    const content = document.createElement("div");
    content.className = "message-content";

    const title = document.createElement("strong");

    if (role === "user") {
        title.textContent = "You";
    } else {
        title.textContent = provider
            ? `SmackLearn Tutor · ${provider}`
            : "SmackLearn Tutor";
    }

    const body = document.createElement("div");
    body.className = "message-body";
    body.innerHTML = formatAnswer(text);

    content.append(title, body);
    article.append(avatar, content);
    chatMessages.appendChild(article);

    scrollToLatest();

    return article;
}

// Show a loading message while the AI generates an answer.
function showTyping() {
    const article = document.createElement("article");

    article.className = "message assistant-message";
    article.id = "typingIndicator";

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = "S";

    const content = document.createElement("div");
    content.className = "message-content";

    const title = document.createElement("strong");
    title.textContent = "SmackLearn Tutor";

    const message = document.createElement("p");
    message.textContent = "Thinking...";

    content.append(title, message);
    article.append(avatar, content);

    chatMessages.appendChild(article);
    scrollToLatest();

    return article;
}

// Check whether the backend and AI providers are configured.
async function checkConnection() {
    connectionStatus.textContent = "Checking backend connection...";

    try {
        const response = await fetch(`${API_URL}/api/health`);

        if (!response.ok) {
            throw new Error("Backend unavailable");
        }

        const data = await response.json();
        const providers = data.providers || {};
        const available = [];

        if (providers.gemini) {
            available.push("Gemini");
        }

        if (providers.groq) {
            available.push("Groq");
        }

        connectionStatus.textContent = available.length
            ? `Connected · ${available.join(" + ")} configured`
            : "Backend connected · No AI providers configured";

    } catch (error) {
        connectionStatus.textContent =
            "Backend offline · Start your backend to chat";

        console.error("SmackLearn backend connection error:", error);
    }
}

// Send a question to the backend and display the answer.
async function sendQuestion(question) {
    const cleanQuestion = question.trim();

    if (!cleanQuestion || sendButton.disabled) {
        return;
    }

    if (cleanQuestion.length > 4000) {
        addMessage(
            "assistant",
            "Please keep your question within 4000 characters."
        );
        return;
    }

    // Keep a copy of the original question in the input
    // until the backend successfully returns an answer.
    addMessage("user", cleanQuestion);

    sendButton.disabled = true;
    questionInput.disabled = true;
    sendButton.textContent = "Thinking...";

    const typingIndicator = showTyping();

    try {
        const response = await fetch(`${API_URL}/api/tutor`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                question: cleanQuestion,
                provider: providerSelect.value
            })
        });

        let data;

        try {
            data = await response.json();
        } catch {
            throw new Error(
                "The server returned an invalid response. Please try again."
            );
        }

        if (!response.ok) {
            const details = Array.isArray(data.details)
                ? data.details.join("; ")
                : "";

            throw new Error(
                [data.error || "The AI request failed.", details]
                    .filter(Boolean)
                    .join(" ")
            );
        }

        typingIndicator.remove();

        addMessage(
            "assistant",
            data.answer || "Sorry, the AI returned an empty response.",
            data.provider || providerSelect.value
        );

        // Clear the question only after a successful response.
        questionInput.value = "";

    } catch (error) {
        typingIndicator.remove();

        console.error("SmackLearn tutor request failed:", error);

        addMessage(
            "assistant",
            `Sorry, I couldn't get an answer. ${error.message}\n\nYour question is still in the input box, so you can retry it after checking your connection.`
        );

    } finally {
        sendButton.disabled = false;
        questionInput.disabled = false;
        sendButton.innerHTML = 'Send <span aria-hidden="true">→</span>';
        questionInput.focus();
    }
}

// Handle form submission.
chatForm.addEventListener("submit", event => {
    event.preventDefault();
    sendQuestion(questionInput.value);
});

// Enter sends the question; Shift + Enter creates a new line.
questionInput.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        chatForm.requestSubmit();
    }
});

// Handle suggested questions.
if (suggestions) {
    suggestions.addEventListener("click", event => {
        const button = event.target.closest("[data-question]");

        if (!button) {
            return;
        }

        questionInput.value = button.dataset.question;
        questionInput.focus();
    });
}

// Update the footer year.
const currentYear = document.getElementById("currentYear");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}

// Basic theme toggle for the Tutor page.
const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("light-theme");

        const isLight =
            document.body.classList.contains("light-theme");

        themeToggle.textContent = isLight ? "☀" : "☾";
    });
}

// Check the backend when the page loads.
checkConnection();