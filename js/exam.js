// ========================================
// SMACKLEARN EXAM MODE
// Day 1: Exam Configuration
// ========================================

const examForm = document.getElementById("examSetupForm");

const subjectInput = document.getElementById("examSubject");
const questionsInput = document.getElementById("examQuestions");
const durationInput = document.getElementById("examDuration");

const summarySubject = document.getElementById("summarySubject");
const summaryQuestions = document.getElementById("summaryQuestions");
const summaryDuration = document.getElementById("summaryDuration");
const summaryDifficulty = document.getElementById("summaryDifficulty");

function getDifficulty() {
    const selected = document.querySelector(
        'input[name="difficulty"]:checked'
    );

    return selected ? selected.value : "Medium";
}

function updateExamSummary() {
    summarySubject.textContent = subjectInput.value;
    summaryQuestions.textContent = questionsInput.value;
    summaryDuration.textContent = `${durationInput.value} min`;
    summaryDifficulty.textContent = getDifficulty();
}

subjectInput.addEventListener("change", updateExamSummary);
questionsInput.addEventListener("change", updateExamSummary);
durationInput.addEventListener("change", updateExamSummary);

document.querySelectorAll('input[name="difficulty"]').forEach((input) => {
    input.addEventListener("change", updateExamSummary);
});

examForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const examSettings = {
        subject: subjectInput.value,
        questions: Number(questionsInput.value),
        duration: Number(durationInput.value),
        difficulty: getDifficulty()
    };

    // Save the selected configuration for Day 2.
    sessionStorage.setItem(
        "smacklearnExamSettings",
        JSON.stringify(examSettings)
    );

    alert(
        "Your exam settings are ready!\n\n" +
        "Subject: " + examSettings.subject + "\n" +
        "Questions: " + examSettings.questions + "\n" +
        "Duration: " + examSettings.duration + " minutes\n" +
        "Difficulty: " + examSettings.difficulty + "\n\n" +
        "The actual exam engine is coming in the next development step."
    );
});

updateExamSummary();