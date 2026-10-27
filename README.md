# Smacklearn 📚

**An AI-powered learning platform designed to make studying more interactive and productive.**

Smacklearn brings AI-assisted learning tools into one place, helping students explore topics, work with study notes, and practise what they learn.

<!-- Once deployed, add: 🔗 **Live demo:** https://your-live-url -->
<!-- Once the UI is ready, add a screenshot: ![Smacklearn screenshot](screenshot.png) -->

---

## ✨ Features

### 🤖 AI Tutor
- Ask questions and receive AI-generated explanations.
- Integrates **Groq** and **Google Gemini**.
- Supports automatic provider fallback.

### 📝 Notes-to-Exam
- Upload **PDF, TXT and DOCX** study notes.
- Extract text from uploaded documents.
- Generate multiple-choice questions from your notes.
- Answer questions interactively.
- Check your score and review correct answers with explanations.

### 📖 Learning Workspace
- A dedicated learning interface.
- Access learning features from the Smacklearn website.

### 🧠 AI Study Kit
- Backend endpoint for generating AI-assisted study materials.

### 🎯 Practice Exams
- Dedicated exam interface for practising and reviewing answers.

---

## 🛠️ Technology Stack

| Area | Technologies |
|------|--------------|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Node.js, Express.js, REST API |
| AI Providers | Groq, Google Gemini |
| Document Processing | PDF text extraction, TXT file reading, DOCX text extraction |

---

## 📁 Project Structure

```
Smacklearn/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── css/
│   ├── style.css
│   ├── learning.css
│   ├── tutor.css
│   ├── exam.css
│   └── notes-exam.css
├── js/
│   ├── app.js
│   ├── learning.js
│   ├── tutor.js
│   ├── exam.js
│   └── notes-exam.js
├── index.html
├── learning.html
├── tutor.html
├── exam.html
└── notes-exam.html
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) and npm
- A Groq API key and/or a Google Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/jayy0101/Smacklearn.git
cd Smacklearn
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure API keys

Create a `.env` file inside the `backend` directory and add your own keys:

```env
PORT=3000
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
```

Replace the example values with your own keys. **Never commit your real `.env` file to GitHub.**

### 4. Start the backend

From the `backend` directory, run:

```bash
node server.js
```

The backend should start at `http://localhost:3000`.

### 5. Open the frontend

Open `index.html` in your browser using a local development server, such as the **Live Server** extension in Visual Studio Code.

> Keep the backend running while using the AI-powered features.

---

## 🔌 Backend API

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Backend welcome/status response |
| GET | `/api/health` | Check backend health |
| POST | `/api/tutor` | Ask the AI Tutor a question |
| POST | `/api/study-kit` | Generate AI-assisted study materials |
| POST | `/api/notes-exam/extract` | Extract text from uploaded notes |
| POST | `/api/notes-exam/generate` | Generate an exam from study notes |

---

## 🔐 Security

- API keys belong in the backend `.env` file.
- Do not expose secret API keys in frontend JavaScript.
- Do not commit `.env` files or other credentials.
- Configure appropriate CORS restrictions before production deployment.

---

## 🗺️ Future Improvements

- Custom question counts and difficulty selection.
- Saved exam history and progress tracking.
- Additional question types.
- Improved accessibility and responsive design.
- Production deployment and automated tests.

---

## 👨‍💻 Developer

**Jaydev Singh**
GitHub: [@jayy0101](https://github.com/jayy0101)

---

*Smacklearn is an educational project exploring AI-assisted learning and interactive study tools.*
