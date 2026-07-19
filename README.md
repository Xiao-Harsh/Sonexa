# 🎵 SONEXA — Decentralized Music Player

SONEXA is a modern, high-performance web-based music application powered by the decentralized **Audius Music Protocol**. It features a clean, ad-free user interface allowing users to explore trending independent music, create custom playlists, bookmark favorites, and stream high-fidelity audio tracks.

The system is built on a distributed micro-architecture consisting of a high-performance **React 19 SPA** frontend and a secure **Spring Boot** API gateway backed by a **Redis** caching and node-failover routing cluster.

---

## 🚀 Key Architectural Features

* **JWT-Based Authentication:** Stateless uCompress Mascots: Pre-compile or minify the raw SVGs inside avatars.tsx to save a few minor bytes of space.
Redis Failover Logging: Add alert triggers to the background node scheduler so you are instantly notified if multiple Audius API nodes drop offline at once.
* **Smart Gateway Proxy Caching:** Proxies Compress Mascots: Pre-compile or minify the raw SVGs inside avatars.tsx to save a few minor bytes of space.
Redis Failover Logging: Add alert triggers to the background node scheduler so you are instantly notified if multiple Audius API nodes drop offline at once.
* **Apple-Style Fullscreen Overlay:** SleekCompress Mascots: Pre-compile or minify the raw SVGs inside avatars.tsx to save a few minor bytes of space.
Redis Failover Logging: Add alert triggers to the background node scheduler so you are instantly notified if multiple Audius API nodes drop offline at once.
* **Decentralized Node Failover Scheduler:*Compress Mascots: Pre-compile or minify the raw SVGs inside avatars.tsx to save a few minor bytes of space.
Redis Failover Logging: Add alert triggers to the background node scheduler so you are instantly notified if multiple Audius API nodes drop offline at once.
* **Persistent Playback Store:** Zustand state synchronization that maintains persistent playback state, active queue indexing, and user library details.
* **Vibrant Vector Mascots:** Personalize user dashboards using 5 custom-designed vector mascot profile badges.

---

## 🛠️ Technology Stack

| Layer | Component | Technologies |
| :--- | :--- | :--- |
| **Frontend** | Application Core | React 19, TypeScript, Vite, React Router |
| | State Management | Zustand |
| | Styling & Animation | Tailwind CSS v4, Framer Motion, Lucide Icons |
| **Backend** | API Gateway | Java 17, Spring Boot 3, Spring Web |
| | Security | Spring Security, JWT (JSON Web Tokens) |
| | Persistence | Spring Data JPA, Hibernate, MySQL |
| **Caching** | Cluster Store | Redis (Caching query routes & healthy API nodes) |

---

## 📂 Project Structure

```text
HiyaXiao/
├── backend/                  # Spring Boot REST API
│   ├── src/main/java/        # Java source code
│   │   └── com/musicapp/     # Auth, streaming, and database components
│   ├── src/main/resources/   # App configurations & credentials
│   └── pom.xml               # Maven configuration
├── frontend/                 # React Single Page Application
│   ├── src/                  # React components, pages, stores, and hooks
│   ├── public/               # Public favicon & static assets
│   ├── index.html            # SPA Entrypoint HTML
│   └── package.json          # Node configuration
└── README.md                 # Main Documentation
```

---

## ⚙️ Getting Started & Local Setup

### Prerequisites
Make sure you have the following installed on your machine:
* **Java Development Kit (JDK) 17** or higher
* **Node.js** (v18.x or higher) & **npm**
* **MySQL** Server
* **Redis** Server

---

### Step 1: Database Initialization
Log in to your MySQL terminal and run the following command to initialize the project schema:
```sql
CREATE DATABASE music_player;
```

---

### Step 2: Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Copy the sample environment template file to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and fill in your local system configuration details (MySQL credentials, Redis ports, etc.).
4. Launch the Spring Boot application using the Maven wrapper:
   * **Windows (PowerShell):**
     ```powershell
     ./mvnw.cmd spring-boot:run
     ```
   * **macOS / Linux:**
     ```bash
     ./mvnw spring-boot:run
     ```
   The backend API gateway will boot up successfully on `http://localhost:8080`.

---

### Step 3: Frontend Setup
1. Open a new terminal window and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Copy the sample environment template file to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Install the project package dependencies:
   ```bash
   npm install
   ```
4. Start the local Vite development server:
   ```bash
   npm run dev
   ```
   The frontend application will start and be accessible at `http://localhost:5173`.

---

## 🔒 Security & Performance Policies

1. **Stateless Sessions:** User account data is protected via standard Authorization Header JWT validation. Tokens are signed via SHA-256 HMAC algorithms.
2. **Redis Query Guarding:** External searches and trending requests are cached with dynamic TTL structures in Redis. This reduces latency on duplicate requests to `< 15ms`.
3. **Buffer Guarding:** Interactive timeline scrubbing runs on separate event loops to avoid playback buffers stalling during playback.
