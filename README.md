# 🎵 Sonexa - Web3 Decentralized Music Streaming Application

Sonexa is a full-stack, web-based music streaming platform powered by the **Audius Music Protocol**. Built with a **React 19 & Vite** frontend and a **Spring Boot 3** API Gateway, Sonexa utilizes **Upstash Redis caching** for low-latency request processing, automated **node failover routing**, and **TiDB Cloud** for secure user library persistence.

---

## ✨ Core Features

* 🔐 **User Authentication:** Secure registration and session management powered by Spring Security 6 and dual-token JSON Web Tokens (JWT).
* 🔄 **Node Failover Routing:** Background scheduler queries Audius network bootstrap nodes every 10 minutes, caches active discovery instances in Redis, and automatically routes around offline nodes.
* ⚡ **Low-Latency Caching:** Caches search results (10m), trending charts (15m), and track metadata (60m) in Redis to deliver instant playback under 5ms.
* 🎧 **Persistent Player UI:** Expandable audio player with queue management, volume controls, and route-independent state persistence powered by Zustand and Framer Motion.
* 📂 **Personal Library:** Save favorite tracks, create and reorder custom playlists, and track recent listening history.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS v4, Framer Motion, Lucide Icons, Zustand, Axios, React Router DOM v7 |
| **Backend** | Java 21, Spring Boot 3.3.1, Spring Security 6, JJWT (JWT), Spring Data JPA, Hibernate 6, Maven |
| **Databases** | TiDB Cloud / MySQL (Relational persistence), Upstash Redis (In-memory caching & node pool) |
| **Decentralized API**| Audius Music Protocol |

---

## 📁 Project Structure

```text
Sonexa/
├── backend/       # Spring Boot 3 REST API Gateway, Security Configs, & Schedulers
└── frontend/      # React 19 Single Page Application & Zustand Store
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **JDK 17+** (Java Development Kit)
* **Node.js (v18+) & npm**
* **MySQL / TiDB** & **Redis** (Local or Cloud instance)

---

### Setup Instructions

#### 1. Database Initialization
Create a MySQL database for the application (or use TiDB Cloud):
```sql
CREATE DATABASE music_player;
```

#### 2. Backend Startup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
3. Update `.env` with your database and Redis connection details:
   ```ini
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=music_player
   DB_USER=root
   DB_PASS=your_password
   
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```
4. Run the Spring Boot application:
   * **Windows (PowerShell):**
     ```powershell
     .\mvnw.cmd spring-boot:run
     ```
   * **macOS / Linux:**
     ```bash
     ./mvnw spring-boot:run
     ```
   * *Server will start on `http://localhost:8080`*

#### 3. Frontend Startup
1. Open a new terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```
2. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies and start Vite dev server:
   ```bash
   npm install
   npm run dev
   ```
   * *Application accessible at `http://localhost:5173`*

---

## 🟢 Render Keep-Alive (24/7 Uptime)

To prevent the Render free-tier backend from spinning down after 15 minutes of inactivity:
1. Set up a free HTTP monitor using an external service like **[UptimeRobot](https://uptimerobot.com)** or **[Cron-job.org](https://cron-job.org)**.
2. Configure a `GET` request every **5 minutes** pointing to:
   ```text
   https://YOUR-RENDER-BACKEND.onrender.com/health
   ```
3. The endpoint returns `{"status": "ok"}` with HTTP 200 without database overhead, keeping your server warm 24/7.
