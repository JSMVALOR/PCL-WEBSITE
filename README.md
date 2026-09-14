# Prudentia College of Law – Website & ERP Platform

Welcome to the central repository for the **Prudentia College of Law** digital infrastructure. This project encompasses both the public-facing collegiate website and the secure, multi-role Enterprise Resource Planning (ERP) portal used by students, faculty, and administrators.

## 🚀 Features

- **Public Website:** A stunning, highly-interactive landing experience designed with GSAP animations and 3D Canvas elements (Three.js).
- **Admissions Pipeline:** End-to-end application tracking and automated student onboarding.
- **Student Portal:** Access to attendance, academic records, mentorship logs, internships, and digital lockers.
- **Faculty Portal:** Course management, attendance tracking, grading, and mentee oversight.
- **Admin Command Center:** Real-time web traffic analytics, fee tracking, facility management, and role provisioning.

## 🛠 Tech Stack

- **Frontend Framework:** React 19 + Vite
- **Styling:** Vanilla CSS + Tailwind CSS (v4)
- **Database & Auth:** Supabase (PostgreSQL + GoTrue)
- **Animations:** GSAP & Framer Motion
- **3D Graphics:** React Three Fiber (`@react-three/fiber`, `three`)
- **PDF Generation:** `jspdf`, `react-to-pdf`

## ⚙️ Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd "PCL WEBSITE V6"
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Ensure you have a `.env` file at the root of the project with the following keys for Supabase connectivity:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```

---

## 📜 Open Source Software (OSS) Compliance & Licensing

This project relies on robust Open Source Software to deliver high performance and security. We have conducted a comprehensive audit of all direct and transitive dependencies (over 600 packages) to ensure strict adherence to intellectual property and licensing compliances.

### Overall License Breakdown
The dependency tree is heavily rooted in permissive, open-source licenses that allow for commercial, private, and internal enterprise usage.

| License Type | Package Count | Usage Terms & Compliance |
| :--- | :--- | :--- |
| **MIT** | 581 | Fully permissive for commercial use, modification, and distribution. Requires preservation of copyright notices. |
| **ISC** | 26 | Functionally equivalent to MIT. Fully permissive. |
| **Apache-2.0** | 15 | Permissive license that also provides an express grant of patent rights from contributors. |
| **BSD (2/3-Clause)** | 15 | Permissive; similar to MIT but with non-endorsement clauses. |
| **BlueOak-1.0.0**| 9 | A modern permissive license designed to be legally precise and easy to read. |
| **MPL-2.0** | 3 | Weak copyleft. Modifications to MPL-licensed files must be released under MPL, but can be combined with proprietary code. |
| **Zlib / Unlicense / CC0**| 5 | Public domain or highly permissive equivalent. |

### Notable Proprietary / Custom Licenses
- **GSAP (GreenSock Animation Platform):** 
  - **License:** Standard 'No Charge' License (Custom)
  - **Compliance Note:** GSAP is free to use in this project as the ERP and website do not charge end-users a direct fee to access the animated content. If this model changes to a SaaS where access to the animations requires a subscription, a commercial **Club GSAP** license will be required.

### Compliance Statement
All packages analyzed conform to standard enterprise open-source policies. No strong-copyleft licenses (such as GPL or AGPL) are present in the frontend bundled code, ensuring that the proprietary nature of the Prudentia College of Law ERP source code is fully protected and not forced into the open-source domain.

---
*Maintained by the Prudentia College of Law IT Division.*
# PCL
