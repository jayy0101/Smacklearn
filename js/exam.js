// ========================================
// SMACKLEARN EXAM MODE
// Day 2: Examination Engine
// ========================================

const examForm = document.getElementById("examSetupForm");

const subjectInput = document.getElementById("examSubject");
const questionsInput = document.getElementById("examQuestions");
const durationInput = document.getElementById("examDuration");

const summarySubject = document.getElementById("summarySubject");
const summaryQuestions = document.getElementById("summaryQuestions");
const summaryDuration = document.getElementById("summaryDuration");
const summaryDifficulty = document.getElementById("summaryDifficulty");

const setupCard = document.querySelector(".exam-setup-card");
const examInterface = document.getElementById("examInterface");

// Exam interface elements
const liveExamTitle = document.getElementById("liveExamTitle");
const liveExamDetails = document.getElementById("liveExamDetails");
const examTimer = document.getElementById("examTimer");
const examProgressBar = document.getElementById("examProgressBar");

const questionCounter = document.getElementById("questionCounter");
const questionText = document.getElementById("questionText");
const answerOptions = document.getElementById("answerOptions");
const questionPalette = document.getElementById("questionPalette");

const previousQuestionButton = document.getElementById("previousQuestion");
const nextQuestionButton = document.getElementById("nextQuestion");
const reviewButton = document.getElementById("reviewButton");
const submitExamButton = document.getElementById("submitExam");

const answeredCount = document.getElementById("answeredCount");
const unansweredCount = document.getElementById("unansweredCount");
const reviewCount = document.getElementById("reviewCount");

// ========================================
// DAY 1: EXAM CONFIGURATION
// ========================================

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

// ========================================
// QUESTION BANK
// These are original practice questions.
// ========================================

const questionBank = {
    "C Programming": [
        {
            question: "Which symbol terminates a statement in C?",
            options: ["Colon (:)", "Semicolon (;)", "Comma (,)", "Full stop (.)"],
            answer: 1
        },
        {
            question: "Which function is the usual entry point of a C program?",
            options: ["start()", "run()", "main()", "init()"],
            answer: 2
        },
        {
            question: "Which format specifier is commonly used to print an int with printf?",
            options: ["%c", "%f", "%s", "%d"],
            answer: 3
        },
        {
            question: "Which header is needed for printf()?",
            options: ["<stdio.h>", "<math.h>", "<string.h>", "<stdlib>"],
            answer: 0
        },
        {
            question: "Which operator gives the remainder of integer division?",
            options: ["/", "%", "*", "//"],
            answer: 1
        },
        {
            question: "Which data type stores a single character in C?",
            options: ["word", "string", "char", "character"],
            answer: 2
        },
        {
            question: "Which loop checks its condition before each iteration?",
            options: ["while", "switch", "case", "typedef"],
            answer: 0
        },
        {
            question: "Array indexing in C normally starts at which index?",
            options: ["1", "-1", "0", "Depends on the compiler"],
            answer: 2
        },
        {
            question: "Which operator checks equality?",
            options: ["=", "==", "!=", "=>"],
            answer: 1
        },
        {
            question: "Which keyword declares a constant-qualified variable?",
            options: ["fixed", "static", "constant", "const"],
            answer: 3
        }
    ],

    "C++": [
        {
            question: "Which stream is commonly used for console output in C++?",
            options: ["cin", "cout", "cerrin", "print"],
            answer: 1
        },
        {
            question: "Which symbol ends a normal C++ statement?",
            options: [":", ";", ",", "."],
            answer: 1
        },
        {
            question: "Which operator is used with cin to extract input?",
            options: ["<<", ">>", "==", "&&"],
            answer: 1
        },
        {
            question: "Which header provides the standard cout stream?",
            options: ["<iostream>", "<stdio.h>", "<string.h>", "<fstream.h>"],
            answer: 0
        },
        {
            question: "Which concept allows a class to have multiple functions with the same name but different parameter lists?",
            options: ["Inheritance", "Encapsulation", "Overloading", "Recursion"],
            answer: 2
        },
        {
            question: "Which access specifier makes class members accessible only to the class and its friends?",
            options: ["public", "private", "external", "global"],
            answer: 1
        },
        {
            question: "Which loop executes its body at least once?",
            options: ["for", "while", "do-while", "range-for"],
            answer: 2
        },
        {
            question: "Which operator accesses a member through an object?",
            options: [".", "::", "->>", "#"],
            answer: 0
        },
        {
            question: "What is the usual return type of main() in standard C++?",
            options: ["void", "float", "char", "int"],
            answer: 3
        },
        {
            question: "Which container stores elements in a dynamically resizable sequence?",
            options: ["vector", "int", "namespace", "enum"],
            answer: 0
        }
    ],

    "Java": [
        {
            question: "Which keyword is used to define a class in Java?",
            options: ["define", "class", "struct", "object"],
            answer: 1
        },
        {
            question: "Which method is the usual entry point of a Java application?",
            options: ["run()", "start()", "main()", "execute()"],
            answer: 2
        },
        {
            question: "Which keyword creates an object in Java?",
            options: ["new", "make", "create", "object"],
            answer: 0
        },
        {
            question: "Which type stores a true or false value?",
            options: ["int", "char", "String", "boolean"],
            answer: 3
        },
        {
            question: "Which keyword refers to the current object?",
            options: ["super", "this", "self", "current"],
            answer: 1
        },
        {
            question: "Which access modifier allows access from any class, subject to module and package rules?",
            options: ["private", "protected", "public", "local"],
            answer: 2
        },
        {
            question: "Which loop executes its body at least once?",
            options: ["do-while", "for", "while", "enhanced for"],
            answer: 0
        },
        {
            question: "Which keyword is used to inherit a class in Java?",
            options: ["implements", "inherits", "extends", "superclass"],
            answer: 2
        },
        {
            question: "Which method compares String contents?",
            options: ["same()", "equals()", "compareObject()", "identical()"],
            answer: 1
        },
        {
            question: "Which keyword prevents a class from being subclassed?",
            options: ["static", "private", "abstract", "final"],
            answer: 3
        }
    ],

    "Python": [
        {
            question: "Which symbol starts a single-line comment in Python?",
            options: ["//", "#", "<!--", "/*"],
            answer: 1
        },
        {
            question: "Which built-in function displays output?",
            options: ["echo()", "write()", "print()", "displayText()"],
            answer: 2
        },
        {
            question: "Which collection stores ordered, mutable elements?",
            options: ["list", "tuple", "frozenset", "string"],
            answer: 0
        },
        {
            question: "Which keyword defines a function?",
            options: ["function", "func", "define", "def"],
            answer: 3
        },
        {
            question: "What is the result of 7 // 2 in Python?",
            options: ["3.5", "3", "4", "2"],
            answer: 1
        },
        {
            question: "Which value represents the absence of a value?",
            options: ["undefined", "empty", "None", "null"],
            answer: 2
        },
        {
            question: "Which method adds one item to the end of a list?",
            options: ["append()", "addEnd()", "insertLast()", "pushBack()"],
            answer: 0
        },
        {
            question: "Which brackets create a dictionary literal?",
            options: ["[]", "()", "||", "{}"],
            answer: 3
        },
        {
            question: "Which keyword begins a conditional branch?",
            options: ["when", "if", "check", "switch"],
            answer: 1
        },
        {
            question: "What does len([10, 20, 30]) return?",
            options: ["2", "10", "3", "30"],
            answer: 2
        }
    ],

    "DBMS": [
        {
            question: "What does DBMS stand for?",
            options: ["Database Management System", "Data Backup Memory Service", "Digital Base Mapping System", "Database Machine Software"],
            answer: 0
        },
        {
            question: "Which SQL command retrieves records?",
            options: ["FETCHALL", "SELECT", "READ", "OPEN"],
            answer: 1
        },
        {
            question: "Which key uniquely identifies each row in a table?",
            options: ["Foreign key", "Alternate key", "Primary key", "Partial key"],
            answer: 2
        },
        {
            question: "Which SQL clause filters rows?",
            options: ["ORDER BY", "GROUP BY", "SELECT", "WHERE"],
            answer: 3
        },
        {
            question: "Which command removes a table definition and its data?",
            options: ["DROP TABLE", "DELETE ROW", "REMOVE TABLE", "CLEAR TABLE"],
            answer: 0
        },
        {
            question: "Which normal form removes repeating groups and requires atomic attribute values?",
            options: ["2NF", "1NF", "3NF", "BCNF only"],
            answer: 1
        },
        {
            question: "Which SQL command modifies existing rows?",
            options: ["CHANGE", "MODIFY TABLE", "UPDATE", "ALTER ROW"],
            answer: 2
        },
        {
            question: "Which relationship connects a row to a referenced key in another table?",
            options: ["Candidate key", "Superkey", "Composite key", "Foreign key"],
            answer: 3
        },
        {
            question: "Which clause sorts SQL query results?",
            options: ["ORDER BY", "SORT", "ARRANGE BY", "GROUP BY"],
            answer: 0
        },
        {
            question: "Which ACID property means a transaction is all-or-nothing?",
            options: ["Consistency", "Atomicity", "Isolation", "Durability"],
            answer: 1
        }
    ],

    "Web Technology": [
        {
            question: "Which language defines the structure of a web page?",
            options: ["CSS", "SQL", "HTML", "Python"],
            answer: 2
        },
        {
            question: "Which language is primarily used to style web pages?",
            options: ["CSS", "HTML", "SQL", "Bash"],
            answer: 0
        },
        {
            question: "Which HTML element creates a hyperlink?",
            options: ["<linkto>", "<a>", "<href>", "<url>"],
            answer: 1
        },
        {
            question: "Which attribute specifies an image's source?",
            options: ["href", "alt", "link", "src"],
            answer: 3
        },
        {
            question: "Which JavaScript keyword declares a block-scoped variable that can be reassigned?",
            options: ["let", "const", "fixed", "define"],
            answer: 0
        },
        {
            question: "Which CSS property changes text color?",
            options: ["font-style", "color", "background", "text-align"],
            answer: 1
        },
        {
            question: "Which HTML element contains metadata and links to stylesheets?",
            options: ["body", "footer", "head", "main"],
            answer: 2
        },
        {
            question: "Which HTTP method is commonly used to retrieve a resource?",
            options: ["POST", "PATCH", "DELETE", "GET"],
            answer: 3
        },
        {
            question: "Which JavaScript method selects an element by its ID?",
            options: ["getElementById()", "queryClass()", "selectByName()", "findElement()"],
            answer: 0
        },
        {
            question: "What does CSS stand for?",
            options: ["Computer Style Syntax", "Cascading Style Sheets", "Creative System Styling", "Common Styling Source"],
            answer: 1
        }
    ],

    "Data Structures": [
        {
            question: "Which data structure follows LIFO order?",
            options: ["Queue", "Tree", "Stack", "Graph"],
            answer: 2
        },
        {
            question: "Which data structure follows FIFO order?",
            options: ["Queue", "Stack", "Heap", "Binary search tree"],
            answer: 0
        },
        {
            question: "What is the usual time complexity of binary search on a sorted array?",
            options: ["O(n)", "O(log n)", "O(n²)", "O(1) in every case"],
            answer: 1
        },
        {
            question: "Which structure connects nodes using references or pointers?",
            options: ["Static array", "Integer", "Matrix only", "Linked list"],
            answer: 3
        },
        {
            question: "Which traversal of a binary search tree visits keys in sorted order?",
            options: ["Inorder", "Preorder", "Level order", "Postorder"],
            answer: 0
        },
        {
            question: "Which structure is commonly used for breadth-first search?",
            options: ["Stack", "Queue", "Heap", "Hash function"],
            answer: 1
        },
        {
            question: "Which structure efficiently provides access by key using a hash function?",
            options: ["Stack", "Queue", "Hash table", "Linked list only"],
            answer: 2
        },
        {
            question: "Which operation removes the top item from a stack?",
            options: ["Enqueue", "Insert", "Peek", "Pop"],
            answer: 3
        },
        {
            question: "What is the worst-case time complexity of linear search?",
            options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"],
            answer: 0
        },
        {
            question: "Which structure represents hierarchical parent-child relationships?",
            options: ["Queue", "Tree", "Stack", "Hash table"],
            answer: 1
        }
    ],

    "Artificial Intelligence": [
        {
            question: "What is the main goal of supervised learning?",
            options: ["Store files", "Compress images only", "Learn patterns from labeled examples", "Replace every algorithm with rules"],
            answer: 2
        },
        {
            question: "Which task predicts a continuous numerical value?",
            options: ["Regression", "Classification", "Clustering", "Tokenization"],
            answer: 0
        },
        {
            question: "Which task assigns an input to a discrete category?",
            options: ["Regression", "Classification", "Dimensionality reduction only", "Rendering"],
            answer: 1
        },
        {
            question: "What is a dataset used to fit a machine-learning model called?",
            options: ["Test set", "Output layer", "Deployment set", "Training set"],
            answer: 3
        },
        {
            question: "What does overfitting generally mean?",
            options: ["The model fits training data well but generalizes poorly", "The model cannot store parameters", "The dataset contains no rows", "The model always predicts a constant"],
            answer: 0
        },
        {
            question: "Which is an example of an unsupervised learning task?",
            options: ["Predicting labeled exam results", "Clustering customers without target labels", "Classifying labeled images", "Predicting labeled house prices"],
            answer: 1
        },
        {
            question: "What is the purpose of a test dataset?",
            options: ["Choose variable names", "Duplicate training labels", "Evaluate performance on held-out examples", "Guarantee perfect accuracy"],
            answer: 2
        },
        {
            question: "Which component of a neural network applies a learned transformation to its inputs?",
            options: ["File system", "Web browser", "SQL table", "Layer"],
            answer: 3
        },
        {
            question: "What does AI stand for?",
            options: ["Artificial Intelligence", "Automated Internet", "Algorithmic Interface", "Advanced Integration"],
            answer: 0
        },
        {
            question: "Which metric is the fraction of predictions that are correct?",
            options: ["Recall only", "Accuracy", "Training time", "Batch size"],
            answer: 1
        }
    ],

    "Computer Networks": [
        {
            question: "What does IP stand for in IP address?",
            options: ["Internet Process", "Internal Program", "Internet Protocol", "Interface Port"],
            answer: 2
        },
        {
            question: "Which protocol commonly provides reliable, ordered byte-stream delivery?",
            options: ["TCP", "UDP", "ARP", "ICMP only"],
            answer: 0
        },
        {
            question: "Which device forwards packets between different IP networks?",
            options: ["Repeater", "Router", "Hub", "Keyboard"],
            answer: 1
        },
        {
            question: "Which protocol translates domain names into IP addresses?",
            options: ["FTP", "SMTP", "SSH", "DNS"],
            answer: 3
        },
        {
            question: "How many layers are in the commonly taught OSI model?",
            options: ["7", "4", "5", "6"],
            answer: 0
        },
        {
            question: "Which protocol is commonly used to send email between mail servers?",
            options: ["HTTP", "SMTP", "DHCP", "SNMP"],
            answer: 1
        },
        {
            question: "Which address identifies a network interface at the data-link layer?",
            options: ["URL", "Domain name", "MAC address", "Port number"],
            answer: 2
        },
        {
            question: "Which protocol automatically leases IP configuration to clients?",
            options: ["DNS", "FTP", "HTTP", "DHCP"],
            answer: 3
        },
        {
            question: "Which transport protocol does not guarantee delivery or ordering?",
            options: ["UDP", "TCP", "TLS", "SSH"],
            answer: 0
        },
        {
            question: "What does LAN stand for?",
            options: ["Large Access Node", "Local Area Network", "Linked Application Network", "Long-range Address Network"],
            answer: 1
        }
    ],

    "Operating Systems": [
        {
            question: "Which software manages computer hardware and system resources?",
            options: ["Web browser", "Text editor", "Operating system", "Spreadsheet"],
            answer: 2
        },
        {
            question: "What is a process?",
            options: ["A program in execution", "A stored filename only", "A keyboard shortcut", "A network cable"],
            answer: 0
        },
        {
            question: "Which scheduling method serves processes in arrival order?",
            options: ["Shortest job first", "First come, first served", "Round robin only", "Priority only"],
            answer: 1
        },
        {
            question: "Which condition describes processes waiting indefinitely for resources held by one another?",
            options: ["Paging", "Compilation", "Caching", "Deadlock"],
            answer: 3
        },
        {
            question: "Which technique divides memory into fixed-size blocks called pages?",
            options: ["Paging", "Spooling", "Polling", "Linking"],
            answer: 0
        },
        {
            question: "What is a context switch?",
            options: ["Changing a file extension", "Switching the CPU from one execution context to another", "Changing a screen theme", "Renaming a process"],
            answer: 1
        },
        {
            question: "Which scheduling algorithm assigns each process a time quantum?",
            options: ["FCFS", "Shortest job first", "Round robin", "Non-preemptive priority only"],
            answer: 2
        },
        {
            question: "What is virtual memory?",
            options: ["Only the CPU cache", "A type of keyboard", "A physical disk partition alone", "A memory-management technique that uses secondary storage to extend the address space"],
            answer: 3
        },
        {
            question: "Which is a necessary condition for deadlock?",
            options: ["Circular wait", "Unlimited resources", "No resource ownership", "Every process finishes immediately"],
            answer: 0
        },
        {
            question: "Which component decides which ready process gets CPU time?",
            options: ["Assembler", "CPU scheduler", "File extension", "Device name"],
            answer: 1
        }
    ]
};

// ========================================
// EXAM STATE
// ========================================

let examSettings = null;
let examQuestions = [];
let currentQuestionIndex = 0;
let selectedAnswers = {};
let reviewQuestions = new Set();
let remainingSeconds = 0;
let timerInterval = null;
let examSubmitted = false;

// ========================================
// START EXAM
// ========================================

examForm.addEventListener("submit", function (event) {
    event.preventDefault();

    examSettings = {
        subject: subjectInput.value,
        questions: Number(questionsInput.value),
        duration: Number(durationInput.value),
        difficulty: getDifficulty()
    };

    sessionStorage.setItem(
        "smacklearnExamSettings",
        JSON.stringify(examSettings)
    );

    const availableQuestions = questionBank[examSettings.subject];

    if (!availableQuestions || availableQuestions.length === 0) {
        alert("No questions are available for this subject yet.");
        return;
    }

    // Repeat questions only when the requested count exceeds the bank.
    examQuestions = [];

    while (examQuestions.length < examSettings.questions) {
        const remaining = examSettings.questions - examQuestions.length;
        examQuestions.push(
            ...availableQuestions.slice(0, remaining)
        );
    }

    // Shuffle the selected questions.
    examQuestions.sort(() => Math.random() - 0.5);

    currentQuestionIndex = 0;
    selectedAnswers = {};
    reviewQuestions = new Set();
    examSubmitted = false;

    remainingSeconds = examSettings.duration * 60;

    liveExamTitle.textContent = examSettings.subject;
    liveExamDetails.textContent =
        `${examSettings.questions} Questions · ${examSettings.difficulty}`;

    setupCard.hidden = true;
    examInterface.hidden = false;

    renderQuestion();
    renderPalette();
    updateExamStats();
    startTimer();

    examInterface.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

// ========================================
// RENDER QUESTION
// ========================================

function renderQuestion() {
    const question = examQuestions[currentQuestionIndex];

    questionCounter.textContent =
        `QUESTION ${String(currentQuestionIndex + 1).padStart(2, "0")} / ` +
        `${String(examQuestions.length).padStart(2, "0")}`;

    questionText.textContent = question.question;

    answerOptions.replaceChildren();

    question.options.forEach((option, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "exam-answer-option";

        if (selectedAnswers[currentQuestionIndex] === index) {
            button.classList.add("selected");
            button.setAttribute("aria-pressed", "true");
        } else {
            button.setAttribute("aria-pressed", "false");
        }

        const letter = document.createElement("span");
        letter.className = "exam-option-letter";
        letter.textContent = String.fromCharCode(65 + index);

        const label = document.createElement("span");
        label.textContent = option;

        button.append(letter, label);

        button.addEventListener("click", function () {
            if (examSubmitted) return;

            selectedAnswers[currentQuestionIndex] = index;

            renderQuestion();
            renderPalette();
            updateExamStats();
        });

        answerOptions.appendChild(button);
    });

    reviewButton.classList.toggle(
        "is-marked",
        reviewQuestions.has(currentQuestionIndex)
    );

    reviewButton.textContent = reviewQuestions.has(currentQuestionIndex)
        ? "★ Marked for Review"
        : "☆ Mark for Review";

    previousQuestionButton.disabled = currentQuestionIndex === 0;

    nextQuestionButton.disabled =
        currentQuestionIndex === examQuestions.length - 1;

    examProgressBar.style.width =
        `${((currentQuestionIndex + 1) / examQuestions.length) * 100}%`;

    renderPalette();
}

// ========================================
// QUESTION NAVIGATION
// ========================================

previousQuestionButton.addEventListener("click", function () {
    if (examSubmitted || currentQuestionIndex === 0) return;

    currentQuestionIndex--;
    renderQuestion();
});

nextQuestionButton.addEventListener("click", function () {
    if (
        examSubmitted ||
        currentQuestionIndex >= examQuestions.length - 1
    ) {
        return;
    }

    currentQuestionIndex++;
    renderQuestion();
});

// ========================================
// MARK FOR REVIEW
// ========================================

reviewButton.addEventListener("click", function () {
    if (examSubmitted) return;

    if (reviewQuestions.has(currentQuestionIndex)) {
        reviewQuestions.delete(currentQuestionIndex);
    } else {
        reviewQuestions.add(currentQuestionIndex);
    }

    renderQuestion();
    updateExamStats();
});

// ========================================
// QUESTION PALETTE
// ========================================

function renderPalette() {
    questionPalette.replaceChildren();

    examQuestions.forEach((question, index) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "exam-palette-button";
        button.textContent = index + 1;

        button.setAttribute(
            "aria-label",
            `Question ${index + 1}` +
            (selectedAnswers[index] !== undefined ? ", answered" : ", unanswered") +
            (reviewQuestions.has(index) ? ", marked for review" : "")
        );

        if (index === currentQuestionIndex) {
            button.classList.add("current");
        }

        if (selectedAnswers[index] !== undefined) {
            button.classList.add("answered");
        }

        if (reviewQuestions.has(index)) {
            button.classList.add("review");
        }

        button.addEventListener("click", function () {
            if (examSubmitted) return;

            currentQuestionIndex = index;
            renderQuestion();
        });

        questionPalette.appendChild(button);
    });
}

// ========================================
// ANSWER STATISTICS
// ========================================

function updateExamStats() {
    const answered = Object.keys(selectedAnswers).length;
    const review = reviewQuestions.size;

    answeredCount.textContent = answered;
    unansweredCount.textContent = examQuestions.length - answered;
    reviewCount.textContent = review;
}

// ========================================
// COUNTDOWN TIMER
// ========================================

function startTimer() {
    clearInterval(timerInterval);

    updateTimerDisplay();

    timerInterval = setInterval(function () {
        if (examSubmitted) {
            clearInterval(timerInterval);
            return;
        }

        remainingSeconds--;

        updateTimerDisplay();

        if (remainingSeconds <= 0) {
            clearInterval(timerInterval);

            alert("Time is up! Your examination will now be submitted.");

            submitExam(true);
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    examTimer.textContent =
        `${String(minutes).padStart(2, "0")}:` +
        `${String(seconds).padStart(2, "0")}`;

    const timerContainer = examTimer.closest(".exam-live-timer");

    timerContainer.classList.toggle(
        "timer-warning",
        remainingSeconds <= 60
    );
}

// ========================================
// SUBMIT EXAM
// Day 3 will add a dedicated results page.
// ========================================

submitExamButton.addEventListener("click", function () {
    const unanswered = examQuestions.length -
        Object.keys(selectedAnswers).length;

    const message = unanswered > 0
        ? `You have ${unanswered} unanswered question(s). Submit anyway?`
        : "Are you sure you want to submit your examination?";

    if (confirm(message)) {
        submitExam(false);
    }
});

function submitExam(timeExpired) {
    if (examSubmitted) return;

    examSubmitted = true;
    clearInterval(timerInterval);

    const correct = examQuestions.reduce((total, question, index) => {
        return total + (
            selectedAnswers[index] === question.answer ? 1 : 0
        );
    }, 0);

    const unanswered = examQuestions.length -
        Object.keys(selectedAnswers).length;

    const percentage = Math.round(
        (correct / examQuestions.length) * 100
    );

    const results = {
        subject: examSettings.subject,
        difficulty: examSettings.difficulty,
        totalQuestions: examQuestions.length,
        answered: Object.keys(selectedAnswers).length,
        unanswered,
        correct,
        incorrect: Object.keys(selectedAnswers).length - correct,
        percentage,
        timeExpired,
        timeUsedSeconds: examSettings.duration * 60 - remainingSeconds,
        questions: examQuestions.map((question, index) => ({
            question: question.question,
            options: question.options,
            correctAnswer: question.answer,
            selectedAnswer: selectedAnswers[index] ?? null,
            isCorrect: selectedAnswers[index] === question.answer,
            markedForReview: reviewQuestions.has(index)
        }))
    };

    sessionStorage.setItem(
        "smacklearnExamResults",
        JSON.stringify(results)
    );

    alert(
        "Examination submitted!\n\n" +
        `Score: ${correct}/${examQuestions.length}\n` +
        `Percentage: ${percentage}%\n` +
        `Unanswered: ${unanswered}\n\n` +
        "Your detailed results dashboard will be added on Day 3."
    );

    examTimer.textContent = "SUBMITTED";

    submitExamButton.disabled = true;
    previousQuestionButton.disabled = true;
    nextQuestionButton.disabled = true;
    reviewButton.disabled = true;

    document.querySelectorAll(".exam-palette-button").forEach((button) => {
        button.disabled = true;
    });
}

// ========================================
// INITIALIZE
// ========================================

updateExamSummary();