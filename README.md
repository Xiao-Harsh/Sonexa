# Sonexa

Sonexa is a web-based music application built on the Audius Music Protocol. The system is designed with a React frontend and a Spring Boot API gateway, utilizing Redis caching to ensure low-latency request processing and reliable node failover.

## Core Features

- **User Authentication:** Secure user registration and session management powered by Spring Security and JSON Web Tokens (JWT).
- **Node Failover Routing:** A background service regularly queries the Audius network bootstrap nodes, caches healthy discovery instances in Redis, and automatically routes around offline nodes.
- **Query Caching:** Caches search results, trending lists, and track details in Redis to optimize performance.
- **Interactive Player UI:** Expandable player interface with queue control and state synchronization powered by Zustand and Framer Motion.

## Technology Stack

### Frontend
- **Framework:** React 19, Vite
- **Language:** TypeScript
- **Styling & Animation:** Tailwind CSS v4, Framer Motion, Lucide Icons
- **State Management:** Zustand

### Backend & Caching
- **Framework:** Spring Boot 3
- **Language:** Java 17
- **Security:** Spring Security, JWT (JJWT)
- **Database:** Spring Data JPA, Hibernate, MySQL
- **Caching:** Redis

## Project Structure

```text
Sonexa/
├── backend/       # Spring Boot application, security configs, and schedulers
└── frontend/      # React single page application
```

## Local Installation

### Prerequisites
Ensure the following tools are installed:
- **Java Development Kit (JDK) 17**
- **Node.js** (v18 or higher) and **npm**
- **MySQL Server**
- **Redis Server**

### Setup Instructions

1. **Database Initialization**
   Create a new MySQL database for the application:
   ```sql
   CREATE DATABASE music_player;
   ```

2. **Backend Configuration and Startup**
   - Navigate to the `backend/` directory.
   - Copy the environment variables template:
     ```bash
     cp .env.example .env
     ```
   - Update `.env` with your MySQL credentials and Redis connection details.
   - Run the Spring Boot application:
     - On Windows (PowerShell):
       ```powershell
       ./mvnw.cmd spring-boot:run
       ```
     - On macOS/Linux:
       ```bash
       ./mvnw spring-boot:run
       ```
   - The server will start on `http://localhost:8080`.

3. **Frontend Configuration and Startup**
   - Navigate to the `frontend/` directory.
   - Copy the environment variables template:
     ```bash
     cp .env.example .env
     ```
   - Install dependencies and start the development server:
     ```bash
     npm install
     npm run dev
     ```
   - The application will be accessible at `http://localhost:5173`.
