# Prudentia College of Law – Website & ERP Platform

Welcome to the central repository for the **Prudentia College of Law** digital infrastructure. This project encompasses both the public-facing collegiate website and the secure, multi-role Enterprise Resource Planning (ERP) portal used by students, faculty, and administrators.

## 🚀 Features

- **Public Website:** A stunning, highly-interactive landing experience designed with GSAP animations and 3D Canvas elements (Three.js).
- **Admissions Pipeline:** End-to-end application tracking and automated student onboarding.
- **Student Portal:** Access to attendance, academic records, mentorship logs, internships, and digital lockers.
- **Faculty Portal:** Course management, attendance tracking, grading, and mentee oversight.
- **Admin Command Center:** Real-time web traffic analytics, fee tracking, facility management, and role provisioning.

## ⚙️ How to Download and Run (Local Setup)

To get this project running on your local machine, follow these steps:

1. **Install Node.js:** 
   Ensure you have Node.js installed. If not, download it from [nodejs.org](https://nodejs.org/).

2. **Clone the repository:**
   ```bash
   git clone https://github.com/JSMVALOR/PCL-WEBSITE.git
   cd PCL-WEBSITE
   ```

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Environment Variables:**
   Create a `.env` file at the root of the project with the following keys for Supabase connectivity:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   This will start both the Vite frontend server and the backend email server simultaneously. You can view the website in your browser at `http://localhost:5173`.

## 🛠 Tech Stack

- **Frontend Framework:** React 19 + Vite
- **Styling:** Vanilla CSS + Tailwind CSS (v4)
- **Database & Auth:** Supabase (PostgreSQL + GoTrue)
- **Animations:** GSAP & Framer Motion
- **3D Graphics:** React Three Fiber (`@react-three/fiber`, `three`)

---

## 📜 Open Source Software (OSS) Compliance & Licensing

This project relies on robust Open Source Software. We have conducted a comprehensive audit of all direct and transitive dependencies to ensure strict adherence to intellectual property and licensing compliances.

All packages analyzed conform to standard enterprise open-source policies (MIT, ISC, Apache-2.0, etc.). No strong-copyleft licenses (such as GPL or AGPL) are present in the frontend bundled code, ensuring that the proprietary nature of this ERP source code is fully protected.

---
*Maintained by Velor (JSMVALOR). Not maintained by Prudentia.*
