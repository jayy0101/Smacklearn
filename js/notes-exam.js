const API_URL = "http://localhost:3000";

const notesFile = document.getElementById("notesFile");
const generateExamBtn = document.getElementById("generateExamBtn");
const uploadStatus = document.getElementById("uploadStatus");

let extractedNotes = "";
let extractedFilename = "";

// Generate the exam when the button is clicked.
generateExamBtn.addEventListener("click", async () => {
    const file = notesFile.files[0];

    if (!file) {
        uploadStatus.textContent =
            "Please select a PDF, TXT, or DOCX file.";
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        uploadStatus.textContent =
            "File size must be under 5 MB.";
        return;
    }

    const extension = file.name
        .substring(file.name.lastIndexOf("."))
        .toLowerCase();

    if (![".pdf", ".txt", ".docx"].includes(extension)) {
        uploadStatus.textContent =
            "Only PDF, TXT, and DOCX files are supported.";
        return;
    }

    generateExamBtn.disabled = true;

    try {
        // Step 1: Extract notes from the uploaded file.
        uploadStatus.textContent = "Reading your notes...";

        const formData = new FormData();
        formData.append("notesFile", file);

        const extractResponse = await fetch(
            `${API_URL}/api/notes-exam/extract`,
            {
                method: "POST",
                body: formData
            }
        );

        const extractData = await extractResponse.json();

        if (!extractResponse.ok) {
            throw new Error(
                extractData.error || "Could not read your file."
            );
        }

        extractedNotes = extractData.notes;
        extractedFilename = extractData.filename || file.name;

        if (!extractedNotes || !extractedNotes.trim()) {
            throw new Error(
                "No readable text was found in this file."
            );
        }

        // Step 2: Generate exam questions from the extracted notes.
        generateExamBtn.textContent = "Generating Exam...";
        uploadStatus.textContent =
            `Read ${extractedFilename}. Generating your questions...`;

        const examResponse = await fetch(
            `${API_URL}/api/notes-exam/generate`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    notes: extractedNotes.slice(0, 12000),
                    numberOfQuestions: 10,
                    difficulty: "Medium",
                    provider: "auto"
                })
            }
        );

        const examData = await examResponse.json();

        if (!examResponse.ok) {
            throw new Error(
                examData.error || "Could not generate your exam."
            );
        }

        // Step 3: Display the generated exam.
        displayExam(examData);

        uploadStatus.textContent =
            `Exam generated successfully using ${examData.provider}.`;

    } catch (error) {
        console.error("Notes-to-Exam error:", error);

        uploadStatus.textContent =
            error.message || "Something went wrong. Please try again.";

    } finally {
        generateExamBtn.disabled = false;
        generateExamBtn.textContent = "Generate My Exam";
    }
});

function displayExam(exam) {
    let examContainer = document.getElementById("generatedExam");

    if (!examContainer) {
        examContainer = document.createElement("section");
        examContainer.id = "generatedExam";
        examContainer.className = "generated-exam";

        const uploadSection = generateExamBtn.parentElement;
        uploadSection.insertAdjacentElement("afterend", examContainer);
    }

    examContainer.replaceChildren();

    const heading = document.createElement("h2");
    heading.textContent = exam.title || "Your Practice Exam";
    examContainer.appendChild(heading);

    const instructions = document.createElement("p");
    instructions.textContent =
        "Choose one answer for each question, then check your results.";
    examContainer.appendChild(instructions);

    const form = document.createElement("form");
    form.id = "generatedExamForm";

    exam.questions.forEach((question, index) => {
        const questionBox = document.createElement("fieldset");
        questionBox.className = "exam-question";

        const legend = document.createElement("legend");
        legend.textContent = `${index + 1}. ${question.question}`;
        questionBox.appendChild(legend);

        question.options.forEach((option, optionIndex) => {
            const label = document.createElement("label");
            label.className = "exam-option";

            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = `question-${index}`;
            radio.value = String(optionIndex);
            radio.required = true;

            const optionText = document.createElement("span");
            optionText.textContent = option;

            label.append(radio, optionText);
            questionBox.appendChild(label);
        });

        form.appendChild(questionBox);
    });

    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.textContent = "Check My Answers";
    submitButton.className = "check-exam-btn";
    form.appendChild(submitButton);

    const results = document.createElement("div");
    results.id = "examResults";
    results.setAttribute("aria-live", "polite");

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        let score = 0;
        results.replaceChildren();

        exam.questions.forEach((question, index) => {
            const selected = form.querySelector(
                `input[name="question-${index}"]:checked`
            );

            const resultItem = document.createElement("div");
            resultItem.className = "exam-answer-result";

            const isCorrect =
                Number(selected.value) === question.correctAnswer;

            if (isCorrect) {
                score++;
            }

            const resultTitle = document.createElement("p");
            resultTitle.textContent =
                `${index + 1}. ${isCorrect ? "Correct" : "Incorrect"}`;
            resultItem.appendChild(resultTitle);

            const correctAnswer = document.createElement("p");
            correctAnswer.textContent =
                `Correct answer: ${question.options[question.correctAnswer]}`;
            resultItem.appendChild(correctAnswer);

            if (question.explanation) {
                const explanation = document.createElement("p");
                explanation.textContent = question.explanation;
                resultItem.appendChild(explanation);
            }

            results.appendChild(resultItem);
        });

        const scoreHeading = document.createElement("h3");
        scoreHeading.textContent =
            `Your Score: ${score}/${exam.questions.length} ` +
            `(${Math.round(score / exam.questions.length * 100)}%)`;

        results.prepend(scoreHeading);
        submitButton.disabled = true;
        results.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    examContainer.append(form, results);
    examContainer.scrollIntoView({ behavior: "smooth", block: "start" });
}