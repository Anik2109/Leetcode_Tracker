# Leetcode Tracker

A full-stack LeetCode dashboard that helps users streamline their DSA preparation with personalized tracking, study plans, and contest updates all in one place.

## 🚀 Introduction

**Leetcode Tracker** is a productivity-focused platform designed for competitive programmers and coding enthusiasts. It automates progress tracking on LeetCode, segmenting problems by topic and company, and also provides real-time updates on upcoming contests — minimizing the manual effort needed to stay on top of your coding goals.

This platform is already used by DSA learners to track over problems, visualize their contest performance, and follow structured study plans.

---

## 📚 Table of Contents

- [Leetcode Tracker](#leetcode-tracker)
  - [🚀 Introduction](#-introduction)
  - [📚 Table of Contents](#-table-of-contents)
  - [✨ Features](#-features)
  - [🛠️ Tech Stack](#️-tech-stack)
  - [🧩 Installation](#-installation)
    - [Prerequisites](#prerequisites)
    - [Steps](#steps)
  - [⚙️ Environment Configuration](#️-environment-configuration)
  - [🧪 Usage](#-usage)
    - [Local Development](#local-development)
  - [🌍 Deployment](#-deployment)

---

## ✨ Features

- 🔍 Tracks solved Leetcode problems per user
- 📊 Topic-wise, difficulty-wise, and company-specific analytics
- 📅 Aggregated timeline of upcoming LeetCode contests
- 🧠 Personalized study plans based on user progress
- ⚡ Fast and responsive UI with modern frontend tooling
- 🌐 Full-stack architecture deployed via Vercel (frontend) and Render (backend)

---

## 🛠️ Tech Stack

| Layer       | Technology              |
|------------|--------------------------|
| Frontend   | React, Vite, JavaScript  |
| Backend    | Node.js, Express         |
| Deployment | Vercel (frontend), Render (backend) |
| Utilities  | Cheerio (for scraping), dotenv, ExcelJS |
| Styling    | CSS Modules / Tailwind (if applicable) |

---

## 🧩 Installation

### Prerequisites

- Node.js (v16 or later)
- npm

### Steps

1. **Clone the repository:**

```bash
git clone https://github.com/Anik2109/Leetcode_Tracker.git
cd Leetcode_Tracker
```

2. **Install dependencies:**

```bash
# For the client
cd client
npm install

# For the server
cd ../server
npm install
```

3. **Configure environment variables (see below).**

---

## ⚙️ Environment Configuration

Each subproject (`client/` and `server/`) includes an `.env.example` file with commented instructions.

To configure:

```bash
# In both 'client' and 'server' directories
cp .env.example .env
```

Update the `.env` files with any necessary credentials or config values (API URLs, database URIs, etc.).

---

## 🧪 Usage

### Local Development

Start the backend and frontend locally:

```bash
# In one terminal
cd server
npm start

# In another terminal
cd client
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser to start using the app.

---

## 🌍 Deployment

- **Frontend** is deployed on [Vercel](https://vercel.com/)
- **Backend** is hosted on [Render](https://render.com/)

Make sure to update environment variables in production as needed.

---

> 💡 _Want to contribute?_ Fork the repo, open a pull request, or raise issues. Let’s make CP prep easier for everyone!
