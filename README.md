# ⚡ CGPA Pulse

> A high-performance, full-stack academic analytics portal and grade optimization engine engineered specifically for students at Maharaja Ranjit Singh Punjab Technical University (MRSPTU), Bathinda.

[![Live Deployment](https://img.shields.io/badge/Production-Live-emerald?style=flat-square)](https://cgpa-pulse.vercel.app/)
[![Tech Stack](https://img.shields.io/badge/Architecture-MERN_Stack-blue?style=flat-square)](https://github.com/KhushneetKaur/cgpa-pulse)
[![Developer](https://img.shields.io/badge/Developer-4th_Year_CSE-purple?style=flat-square)](https://github.com/KhushneetKaur)

---

## 🚀 Architectural Overview

`cgpa-pulse` is a robust, full-stack web application designed to solve complex grade management and milestone targeting problems for engineering students. Instead of relying on static spreadsheets, this platform introduces an interactive data-driven environment with a custom prediction engine, real-time analytics, and gamified student leaderboard metrics.

### Key Engineering Features

* **🔮 Algorithmic Target CGPA Predictor:** Implements a backwards-calculating grade-distribution engine. Users input a target graduation score, and the engine evaluates their historical credit-load history to predict exactly what GPA metrics must be maintained across remaining semesters.
* **📊 Live SGPA Tracker:** Real-time credit-weighted evaluation interface built to accurately map MRSPTU’s specific grading schemes and point distributions.
* **🏆 Gamified Leaderboard Engine:** Powered by a MongoDB aggregated queries index to display real-time academic standouts across departments while maintaining optimal query performance.
* **🎨 Premium Hybrid Design System:** Features a bespoke, highly responsive frontend styling layout built from the ground up without heavy UI frameworks. Includes full dark-mode scaling, custom HTML5 Canvas linear-gradient dynamic graphics, and touch-optimized viewports using non-blocking, native intersection observers for smooth mobile scroll-triggered animations.

---

## 🛠️ Technical Stack & System Design

### Frontend Architecture
* **Core Framework:** React.js initialized via Vite for optimized hot module replacement (HMR) and ultra-lean production bundles.
* **State Management & Networking:** Axios library wrapper utilized with customized global interceptors to cleanly handle authorization handshakes, automated token attachments, and global error processing.
* **UI Engine:** Dynamic responsive JavaScript-driven inline layouts paired with HTML5 Canvas for smooth runtime graphics rendering.

### Backend Infrastructure
* **Runtime Environment:** Node.js utilizing the Express.js framework for a scalable, lightweight RESTful routing API.
* **Database Management:** MongoDB Atlas (Cloud Database Instance) for reliable, non-relational document data storage.
* **Security & Auth (Under Active Refactoring):** State-persisted token validation workflows designed to support highly secure mobile and desktop sessions.

---

## 📈 System Flow & Setup

### Prerequisites
* Node.js (v18.x or higher)
* MongoDB Atlas Connection String

### Local Installation & Development

1. **Clone the Repository:**
   ```bash
   git clone [https://github.com/KhushneetKaur/cgpa-pulse.git](https://github.com/KhushneetKaur/cgpa-pulse.git)
   cd cgpa-pulse

2. **Initialize and Execute the Frontend:**
    ```bash
   cd frontend
   npm install
   npm run dev
The client layer will boot locally on http://localhost:5173.

3. **Initialize and Execute the Backend Server:**
   ```bash
   cd ../backend
   npm install
   npm start

## 🚧 Current Engineering Focus (Active Sprint)

* **State Resilience:** Refactoring asynchronous state-hooks for rock-solid authentication states across unstable mobile connection switches.
* **Layout Performance:** Optimizing native IntersectionObserver hooks to dynamically balance UI paint layers during vertical mobile scrolling.
* **Database Scaling:** Developing indexing profiles on MongoDB Collections to safeguard server response speed as user scale expands.

---

## 👨‍💻 Developer Insight

**Khushneet Kaur** — 4th Year Computer Science & Engineering Student.
Focusing on clean application architecture, systematic state management, and modern fluid UX engineering.   
    
   
