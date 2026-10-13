# Gatherly - Backend Architecture & Setup Guide

This document describes the backend architecture, JSON persistent storage, REST API endpoints, testing procedures, and operational details for the **Gatherly** campus event management platform.

---

## 1. Required Software

- **Node.js**: v18.0.0 or later (Tested on Node v24.21.0)
- **npm**: v9.0.0 or later (Tested on npm v11.19.0)
- **PowerShell / Bash / Command Prompt** (Windows, macOS, Linux compatible)

---

## 2. Project Structure & Data Storage

All persistent records are stored in atomic JSON data files located at:
- **Events Data**: `server/data/events.json`
- **Registrations Data**: `server/data/registrations.json`

### Storage Layer Guarantees
- **Safe Initialization / Migration**: If the storage files do not exist, the server automatically initializes them on first boot with seed data preserving the original mock data. The server **never** duplicates or re-seeds sample records on subsequent restarts.
- **Atomic Writes**: All file mutations write to an isolated temporary file (`.tmp`) before renaming, protecting data from corruption in case of unexpected process termination.
- **Mutex Concurrency Queue**: Concurrent reads and writes are serialized through an asynchronous lock to avoid race conditions.
- **Single Source of Truth**: `registeredCount` on every event is strictly calculated from matching records in `registrations.json`, preventing frontend state tampering or out-of-sync counts.

---

## 3. Installation & Setup

Navigate into the project directory (e.g., `Mini-Project-main`):

```bash
# Install all frontend and backend dependencies
npm install
```

*(Note for Windows PowerShell users: if running scripts is restricted by PowerShell ExecutionPolicy, use `npm.cmd install` and `npm.cmd run dev`)*.

---

## 4. Commands to Run the Application

| Command | Action | URL |
| :--- | :--- | :--- |
| `npm run dev` | Runs backend server & Vite frontend together | Frontend: `http://localhost:5173`<br>Backend: `http://localhost:5000` |
| `npm run server` | Runs only the Express backend with hot reloading (`tsx`) | `http://localhost:5000` |
| `npm run client` | Runs only the Vite frontend dev server | `http://localhost:5173` |
| `npm run build` | Compiles frontend for production | Outputs to `dist/` |
| `npm run lint` | Runs TypeScript compiler verification (`tsc --noEmit`) | Console output |
| `npm test` / `node server/test_api.cjs` | Runs the automated API test suite against running server | Console output |

---

## 5. API Endpoints & Example Requests

### Base URL: `http://localhost:5000` (or `/api` via Vite proxy)

### Health Check
- **`GET /api/health`**
  - **Response (200 OK)**:
    ```json
    {
      "status": "ok",
      "service": "Gatherly Event Management API",
      "version": "1.0.0",
      "timestamp": "2026-10-13T14:26:00.000Z"
    }
    ```

---

### Feature 1: Event Management API

#### 1. `GET /api/events`
Returns all events with calculated `registeredCount`. Supports optional query filtering.
- **Query Parameters**:
  - `category` (optional, string): Case-insensitive category match (e.g. `Hackathon`, `Tech Workshop`)
  - `search` or `q` (optional, string): Case-insensitive search on title, description, venue, or category
- **Example Response (200 OK)**:
  ```json
  [
    {
      "id": "evt-1",
      "title": "Intro to Web3 & Smart Contracts",
      "category": "Tech Workshop",
      "type": "Tech Workshop",
      "status": "Active",
      "date": "Oct 24 • 5:00 PM",
      "time": "5:00 PM - 7:30 PM",
      "venue": "Innovation Center, Room 204",
      "registeredCount": 3,
      "capacity": 150,
      "image": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
      "description": "Hands-on session on Ethereum development...",
      "eligibleYears": ["Freshman", "Sophomore", "Junior", "Senior"],
      "seatPass": "Zone B-14",
      "organizer": "GDSC Web3 Chapter"
    }
  ]
  ```

#### 2. `GET /api/events/:id`
Returns a single event by ID.
- **Example Success Response (200 OK)**: Full `EventItem` object.
- **Example Not Found Response (404 Not Found)**:
  ```json
  {
    "error": "Event not found",
    "message": "No event found with id 'invalid-id'"
  }
  ```

#### 3. `POST /api/events`
Creates and persists a new event.
- **Validation**: Requires `title` (min 3 chars), `date`, `time`, `venue`, and `category`. `capacity` must be a positive number if provided.
- **Example Request Body**:
  ```json
  {
    "title": "AI Agents & LLM Hackathon 2024",
    "category": "Hackathon",
    "type": "Hackathon",
    "date": "Nov 12 • 9:00 AM",
    "time": "9:00 AM - 9:00 PM",
    "venue": "Computer Science Complex, Hall A",
    "capacity": 50,
    "description": "Build autonomous agent workflows with DeepMind toolkits.",
    "eligibleYears": ["Junior", "Senior"],
    "organizer": "AI Student Society"
  }
  ```
- **Example Response (201 Created)**:
  ```json
  {
    "id": "evt-1791901717877-yheu",
    "title": "AI Agents & LLM Hackathon 2024",
    "category": "Hackathon",
    "type": "Hackathon",
    "status": "Upcoming",
    "date": "Nov 12 • 9:00 AM",
    "time": "9:00 AM - 9:00 PM",
    "venue": "Computer Science Complex, Hall A",
    "capacity": 50,
    "registeredCount": 0,
    "image": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
    "description": "Build autonomous agent workflows with DeepMind toolkits.",
    "eligibleYears": ["Junior", "Senior"],
    "seatPass": "General Admission",
    "organizer": "AI Student Society"
  }
  ```
- **Validation Error Response (400 Bad Request)**:
  ```json
  {
    "error": "Validation failed",
    "details": [
      "Title is required and must be at least 3 characters",
      "Venue is required"
    ]
  }
  ```

#### 4. `PUT /api/events/:id`
Updates fields on an existing event.
- **Example Request Body**:
  ```json
  {
    "venue": "Computer Science Auditorium Room 101",
    "capacity": 60
  }
  ```
- **Response**: HTTP 200 with updated `EventItem` (or 404 if event does not exist). Note: client-supplied `id` or `registeredCount` cannot overwrite server records.

#### 5. `DELETE /api/events/:id`
Deletes an event and cascade-deletes all associated registration records from `registrations.json`.
- **Response (200 OK)**:
  ```json
  {
    "message": "Event and associated registrations deleted successfully",
    "id": "evt-1791901717877-yheu",
    "deletedRegistrationsCount": 2
  }
  ```
- **Response (404 Not Found)**: If event does not exist.

---

### Feature 2: Event Registration API

#### 1. `POST /api/events/:id/register`
Registers a student for the specified event.
- **Validation & Business Rules**:
  - Validates event exists (404 if not found).
  - Validates `studentId` is supplied (400 if missing).
  - Rejects duplicate registration for the same student and event (409 Conflict). Supports normalized student ID comparison (e.g. `#GTH-8821` and `GTH-8821`).
  - Rejects registration if event has reached maximum capacity (409 Conflict).
- **Example Request Body**:
  ```json
  {
    "studentId": "#GTH-8821",
    "studentName": "Alex Chen",
    "studentEmail": "alex.chen@campus.edu",
    "seatPass": "Front Row A-01"
  }
  ```
- **Example Success Response (201 Created)**:
  ```json
  {
    "message": "Successfully registered for 'AI Agents & LLM Hackathon 2024'.",
    "registration": {
      "id": "reg-1791901717887-c8qa",
      "eventId": "evt-1791901717877-yheu",
      "studentId": "#GTH-8821",
      "studentName": "Alex Chen",
      "studentEmail": "alex.chen@campus.edu",
      "registeredAt": "2026-10-13T14:28:37.887Z",
      "seatPass": "Front Row A-01"
    },
    "event": {
      "id": "evt-1791901717877-yheu",
      "title": "AI Agents & LLM Hackathon 2024",
      "registeredCount": 1,
      "capacity": 50
    }
  }
  ```
- **Duplicate Registration Rejection (409 Conflict)**:
  ```json
  {
    "error": "Duplicate registration",
    "message": "Student '#GTH-8821' is already registered for event 'AI Agents & LLM Hackathon 2024'."
  }
  ```
- **Capacity Reached Rejection (409 Conflict)**:
  ```json
  {
    "error": "Event capacity reached",
    "message": "Event 'VIP Masterclass' has reached its maximum capacity of 1 attendees."
  }
  ```

#### 2. `GET /api/events/:id/registrations`
Returns all stored attendee registrations and count for a particular event.
- **Example Response (200 OK)**:
  ```json
  {
    "eventId": "evt-1",
    "eventTitle": "Intro to Web3 & Smart Contracts",
    "count": 3,
    "capacity": 150,
    "registrations": [
      {
        "id": "reg-seed-1",
        "eventId": "evt-1",
        "studentId": "#GTH-8821",
        "studentName": "Alex Chen",
        "studentEmail": "alex.chen@campus.edu",
        "registeredAt": "2024-10-10T12:00:00.000Z",
        "seatPass": "Zone B-14"
      }
    ]
  }
  ```

#### 3. `GET /api/students/:studentId/registrations`
Returns all events registered by a particular student.
- **Example Response (200 OK)**:
  ```json
  {
    "studentId": "#GTH-8821",
    "count": 2,
    "registrations": [
      {
        "registration": {
          "id": "reg-seed-1",
          "eventId": "evt-1",
          "studentId": "#GTH-8821",
          "seatPass": "Zone B-14"
        },
        "event": {
          "id": "evt-1",
          "title": "Intro to Web3 & Smart Contracts",
          "registeredCount": 3,
          "capacity": 150
        }
      }
    ]
  }
  ```

---

## 6. How to Run the Automated API Test Suite

With the server running (or in a separate terminal), run:

```bash
node server/test_api.cjs
```

The script verifies:
1. Health check endpoint response.
2. Event listing, category filtering (`?category=Hackathon`), and search query (`?search=Web3`).
3. Single event retrieval and 404 for invalid event IDs.
4. Request body validation with 400 response and descriptive error list.
5. Successful event creation (POST 201) and server-generated unique ID.
6. Event retrieval by ID matching created payload.
7. Event modification (PUT 200).
8. Student registration (POST 201).
9. Duplicate registration rejection (409 Conflict) with ID normalization (`#GTH-8821` and `GTH-8821`).
10. Accurate registration count synchronization calculated from stored registrations.
11. Event capacity enforcement (rejecting excess registrations with 409).
12. Event deletion (DELETE 200) with cascade deletion of registrations and 404 verification.

---

## 7. Status of Features: Implemented vs. Simulated

### Actually Implemented Backend Features (Genuine Persistence & Logic)
- **REST Event Management API**: Real Express endpoints for GET, POST, PUT, DELETE with server validation.
- **REST Event Registration API**: Real Express endpoints for POST registration, duplicate prevention, capacity enforcement, and registration lookups.
- **JSON File-Based Persistent Storage**: Real filesystem reads/writes into `events.json` and `registrations.json` with safe atomic temp-file renaming and write locks.
- **Server-Calculated Registration Counts**: Dynamic calculation directly from stored attendee records.
- **Frontend Real API Integration**:
  - Live fetching of events on dashboard mount (`GET /api/events`).
  - Event publishing directly writes to backend (`POST /api/events`).
  - Event editing updates backend (`PUT /api/events/:id`).
  - Event deleting cascades to backend (`DELETE /api/events/:id`).
  - Student registration from "Discover Campus Events" writes to backend (`POST /api/events/:id/register`), immediately activates the event in "My Registered Events", increments attendee count, and opens the digital pass.

### Features That Remain Simulated (Prototype Scope)
- **Authentication & Authorization**: Currently, student and organizer identities are simulated client sessions (e.g., `#GTH-8821` Alex Chen). There is **no production JWT, session cookies, OAuth, or password hashing**. Client-supplied student IDs are trusted as identifiers for this prototype only.
- **Database Engine**: This prototype uses file-based JSON storage, **not a production ACID SQL/NoSQL database**. While safe for development with locking and atomic renaming, it does not provide distributed transactions or high-throughput concurrency scaling.
- **Team Tasks & Event Prep**: Task toggle and addition remain in React component state.
- **Push Telemetry & NFC Scanning**: Sensor reading and campus pass Bluetooth/mesh telemetry remain visual UI simulations.
