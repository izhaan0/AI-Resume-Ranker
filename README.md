# 📄 AI Resume Ranking & ATS System

An intelligent Applicant Tracking System (ATS) built using **FastAPI**, **React**, **NLP**, and **Machine Learning** that automatically ranks resumes based on job descriptions using semantic similarity and skill extraction — wrapped in a stunning, modern frontend experience.

---

## 🚀 Features

### Backend
- 📥 **Resume Parsing** — Upload resumes in PDF or DOCX format and extract structured data (name, skills, experience, education)
- 🧠 **Semantic Similarity Ranking** — Match resumes to job descriptions using transformer-based embeddings (`sentence-transformers`)
- 🔍 **Skill Extraction** — Automatically extract and compare key skills from resumes and job descriptions
- 📊 **ATS Score** — Each resume receives a ranked score indicating its relevance to the job posting
- ⚡ **FastAPI Backend** — High-performance REST API for resume ingestion and ranking
- 🗂️ **Batch Processing** — Rank multiple resumes in a single request

### Frontend
- 🎨 **Modern Dashboard UI** — Sleek dark/light mode interface built with React + Tailwind CSS
- 📂 **Drag & Drop Upload** — Intuitive multi-file resume uploader with live progress indicators
- 📈 **Animated Score Cards** — Candidate cards with circular ATS score meters and color-coded rankings
- 🏷️ **Skill Match Visualization** — Visual diff of matched vs. missing skills with badge chips
- 📋 **Job Description Editor** — Rich text area with live character count and keyword highlights
- 🔎 **Filter & Search** — Filter ranked results by score threshold, skills, or experience level
- 📤 **Export Results** — Download ranked results as CSV or PDF report
- 📱 **Fully Responsive** — Works beautifully on desktop, tablet, and mobile

---

## 🛠️ Tech Stack

| Layer               | Technology |
|---|---|
| Backend              | FastAPI, Python 3.10+ |
| NLP / ML             | spaCy, HuggingFace Transformers, sentence-transformers |
| Resume Parsing       | PyMuPDF (fitz), python-docx, pdfplumber |
| Similarity           | Cosine Similarity, BERT embeddings |
| Storage              | SQLite / PostgreSQL |
| **Frontend**         | **React 18, Vite, Tailwind CSS, Framer Motion** |
| **UI Components**    | **shadcn/ui, Lucide Icons, Recharts** |
| **State Management** | **Zustand + React Query** |
| Deployment           | Docker, Nginx, Uvicorn |

---

## 📁 Project Structure

```
ai-resume-ranker/
│
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI entry point
│   │   ├── routers/
│   │   │   ├── resume.py            # Resume upload & ranking endpoints
│   │   │   └── job.py               # Job description endpoints
│   │   ├── services/
│   │   │   ├── parser.py            # Resume parsing logic
│   │   │   ├── extractor.py         # Skill & keyword extraction
│   │   │   ├── embedder.py          # Sentence embedding generation
│   │   │   └── ranker.py            # Ranking & scoring logic
│   │   ├── models/
│   │   │   └── schemas.py           # Pydantic request/response models
│   │   └── utils/
│   │       └── file_utils.py        # File handling helpers
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/                  # Icons, images, fonts
│       ├── components/
│       │   ├── ui/                  # Reusable UI primitives (Button, Badge, Card)
│       │   ├── UploadZone.jsx       # Drag & drop resume uploader
│       │   ├── JobDescEditor.jsx    # Job description input panel
│       │   ├── CandidateCard.jsx    # Ranked candidate result card
│       │   ├── ScoreMeter.jsx       # Circular ATS score animation
│       │   ├── SkillBadges.jsx      # Matched / missing skill chips
│       │   ├── RankingTable.jsx     # Sortable results table
│       │   └── Navbar.jsx           # Top navigation bar
│       ├── pages/
│       │   ├── Dashboard.jsx        # Main ranking dashboard
│       │   ├── Upload.jsx           # Upload & analyze page
│       │   ├── Results.jsx          # Detailed results view
│       │   └── History.jsx          # Past ranking sessions
│       ├── hooks/
│       │   ├── useRanking.js        # Ranking API hook
│       │   └── useUpload.js         # File upload hook
│       ├── store/
│       │   └── useStore.js          # Zustand global state
│       ├── services/
│       │   └── api.js               # Axios API client
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── data/
│   └── sample_resumes/
│
├── tests/
│   ├── backend/
│   │   ├── test_parser.py
│   │   ├── test_ranker.py
│   │   └── test_api.py
│   └── frontend/
│       └── CandidateCard.test.jsx
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🎨 Frontend UI Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  🔷 ATS Ranker             Dashboard   History   Settings   🌙  │
├───────────────────┬─────────────────────────────────────────────┤
│                   │                                             │
│  📋 Job           │   🏆 Ranked Candidates          [Export ▾] │
│  Description      │                                             │
│                   │  #1  John Doe          ████████░░   87%   │
│  [Rich Text       │      ✅ Python  ✅ ML  ❌ Docker            │
│   Editor with     │      4 yrs exp · john_doe_resume.pdf       │
│   keyword         │                                             │
│   highlights]     │  #2  Jane Smith        ███████░░░   74%   │
│                   │      ✅ FastAPI  ✅ NLP  ❌ AWS             │
│  📂 Upload        │      3 yrs exp · jane_smith_cv.pdf         │
│  Resumes          │                                             │
│                   │  #3  Alex Ray          █████░░░░░   61%   │
│  [Drag & Drop     │      ✅ Python  ❌ ML  ❌ Docker            │
│   Zone with       │      2 yrs exp · alex_ray.docx             │
│   progress]       │                                             │
│                   │  [🔎 Filter by Score]  [🏷 Filter Skills]  │
│  [⚡ Analyze]     │                                             │
└───────────────────┴─────────────────────────────────────────────┘
```

### Key UI Pages

**`/` — Dashboard**  
Overview stats: total resumes analyzed, average ATS score, top candidate highlight, and a bar chart of score distribution.

**`/upload` — Upload & Analyze**  
Two-panel layout: left side for job description input, right side for drag-and-drop resume uploads. A single "Analyze" button triggers the ranking pipeline.

**`/results` — Ranked Results**  
Animated candidate cards sorted by ATS score. Each card shows a circular score meter, matched/missing skill badges, experience summary, and a "View Details" expand panel.

**`/history` — Session History**  
Table of past ranking sessions with timestamps, job title, number of resumes, and quick re-load actions.

---

## ⚙️ Installation & Setup

### Prerequisites

- Python 3.10+
- Node.js 18+ & npm
- (Optional) Docker & Docker Compose

---

### 🐍 Backend Setup

```bash
cd backend

python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate

pip install -r requirements.txt
python -m spacy download en_core_web_sm

cp ../.env.example ../.env

uvicorn app.main:app --reload --port 8000
```

API live at: `http://localhost:8000`  
Swagger docs: `http://localhost:8000/docs`

---

### ⚛️ Frontend Setup

```bash
cd frontend

npm install

echo "VITE_API_URL=http://localhost:8000" > .env.local

npm run dev
```

Frontend live at: `http://localhost:5173`

---

### 🐳 Full Stack with Docker (Recommended)

```bash
docker-compose up --build
```

| Service                       | URL |
|---|---|
| Frontend                      | http://localhost:3000 |
| Backend API                   | http://localhost:8000 |
| API Docs                      | http://localhost:8000/docs |

---

## 📡 API Endpoints

### `POST /api/rank`
Upload a job description and multiple resumes. Returns ranked candidates with ATS scores.

**Request (multipart/form-data):**
```
job_description: string
resumes: List[file]  (.pdf or .docx)
```

**Response:**
```json
{
  "ranked_candidates": [
    {
      "filename": "john_doe_resume.pdf",
      "name": "John Doe",
      "ats_score": 87.4,
      "matched_skills": ["Python", "FastAPI", "Machine Learning"],
      "missing_skills": ["Docker", "Kubernetes"],
      "experience_years": 4
    }
  ]
}
```

### `POST /api/parse`
Parse a single resume and return structured data.

### `GET /api/health`
Health check endpoint.

---

## 🧠 How It Works

```
[React UI]  →  Job Description + Resumes (drag & drop)
                          │
                          ▼
[FastAPI]   →  Parse → Extract → Embed → Score → Rank
                          │
                          ▼
[React UI]  ←  Animated ranked candidate cards with ATS scores
```

1. **Upload** — User pastes a job description and drag-drops resumes in the React UI
2. **Parse** — Backend extracts raw text from PDF/DOCX files
3. **Extract** — NLP pipeline identifies skills, job titles, education, and experience
4. **Embed** — Sentences are converted into semantic vector representations via BERT
5. **Score** — Cosine similarity is computed between JD and each resume embedding
6. **Render** — Sorted candidates are returned and rendered as animated score cards

---

## 🧪 Running Tests

```bash
# Backend tests
cd backend
pytest tests/ -v

# Frontend tests
cd frontend
npm run test
```

---

## 📦 Key Dependencies

**Backend:**
```
fastapi
uvicorn
python-multipart
spacy
sentence-transformers
transformers
pdfplumber
PyMuPDF
python-docx
scikit-learn
numpy
pydantic
python-dotenv
```

**Frontend:**
```
react
vite
tailwindcss
framer-motion
@radix-ui/react-*
lucide-react
recharts
zustand
@tanstack/react-query
axios
react-dropzone
react-router-dom
```

---

## 🗺️ Roadmap

- [ ] Resume parsing (PDF + DOCX)
- [ ] Skill extraction with spaCy NER
- [ ] Semantic similarity scoring with sentence-transformers
- [ ] FastAPI ranking endpoint
- [ ] Batch resume upload
- [ ] React + Tailwind frontend scaffold
- [ ] Drag & drop upload zone with progress
- [ ] Animated ATS score cards with skill badges
- [ ] Dark / light mode toggle
- [ ] Dashboard with score distribution chart
- [ ] Session history page
- [ ] Export ranked results to CSV / PDF
- [ ] Database persistence (PostgreSQL)
- [ ] Authentication & multi-tenant support
- [ ] Resume anonymization for bias reduction
- [ ] AI-generated candidate summary per resume

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## 👤 Author

Built with ❤️ by [Your Name](https://github.com/your-username)
